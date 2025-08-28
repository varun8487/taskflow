import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  : null;

// Webhook secret is read inside the handler so it doesn't warn during build

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe secrets not configured' },
      { status: 500 }
    )
  }
  const stripe = new Stripe(secret, { apiVersion: '2025-08-27.basil' })
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          // Update user subscription in Convex
          if (convex) await convex.mutation(api.users.updateUserSubscription, {
            clerkId: session.metadata?.clerkUserId || '',
            subscriptionTier: 'pro',
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get customer to find the Clerk user ID
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        ) as Stripe.Customer;

        if (customer.metadata?.clerkUserId) {
          let status: 'active' | 'inactive' | 'canceled' | 'past_due';
          
          switch (subscription.status) {
            case 'active':
              status = 'active';
              break;
            case 'past_due':
              status = 'past_due';
              break;
            case 'canceled':
            case 'unpaid':
              status = 'canceled';
              break;
            default:
              status = 'inactive';
          }

          if (convex) await convex.mutation(api.users.updateUserSubscription, {
            clerkId: customer.metadata.clerkUserId,
            subscriptionTier: status === 'active' ? 'pro' : 'starter',
            subscriptionStatus: status,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        ) as Stripe.Customer;

        if (customer.metadata?.clerkUserId) {
          if (convex) await convex.mutation(api.users.updateUserSubscription, {
            clerkId: customer.metadata.clerkUserId,
            subscriptionTier: 'starter',
            subscriptionStatus: 'canceled',
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          const customer = await stripe.customers.retrieve(
            subscription.customer as string
          ) as Stripe.Customer;

          if (customer.metadata?.clerkUserId) {
            if (convex) await convex.mutation(api.users.updateUserSubscription, {
              clerkId: customer.metadata.clerkUserId,
              subscriptionTier: 'starter', // Downgrade on payment failure
              subscriptionStatus: 'past_due',
              stripeCustomerId: customer.id,
              stripeSubscriptionId: subscription.id,
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
