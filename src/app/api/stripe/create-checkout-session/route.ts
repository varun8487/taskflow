import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { TIER_PRICES, SubscriptionTier } from '@/lib/feature-gates';

// Plan configurations for different tiers
const PLAN_CONFIGS = {
  starter: {
    name: 'TaskFlow Starter',
    description: 'Up to 3 teams, basic analytics, and file uploads',
    features: ['3 teams', '10 projects', 'Basic analytics', 'Email support'],
  },
  pro: {
    name: 'TaskFlow Pro',
    description: 'Advanced features for growing teams',
    features: ['10 teams', '50 projects', 'Advanced analytics', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'TaskFlow Enterprise',
    description: 'Unlimited everything for large organizations',
    features: ['Unlimited teams', 'Unlimited projects', 'Advanced security', 'Dedicated support', 'Custom integrations'],
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      return NextResponse.json(
        { error: 'Stripe secret not configured' },
        { status: 500 }
      )
    }
    const stripe = new Stripe(secret, { apiVersion: '2025-08-27.basil' })
    const { userId, userEmail, tier = 'pro' } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Free tier is not available for purchase
    if (tier === 'free') {
      return NextResponse.json(
        { error: 'Free tier is not purchasable' },
        { status: 400 }
      );
    }

    if (!PLAN_CONFIGS[tier as keyof typeof PLAN_CONFIGS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    if (userEmail) {
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customer = await stripe.customers.update(existingCustomers.data[0].id, {
          metadata: { clerkUserId: userId },
        });
      }
    }
    if (!customer) {
      customer = await stripe.customers.create({
        email: userEmail || undefined,
        metadata: { clerkUserId: userId },
      });
    }

    const planConfig = PLAN_CONFIGS[tier as keyof typeof PLAN_CONFIGS];
    const price = TIER_PRICES[tier as SubscriptionTier];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
              metadata: {
                features: planConfig.features.join(', '),
                tier,
              },
            },
            unit_amount: price * 100, // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/billing?success=true&tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/billing?canceled=true`,
      metadata: {
        clerkUserId: userId,
        tier,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
