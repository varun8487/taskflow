import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/../convex/_generated/api'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    // Retrieve checkout session with expanded subscription and customer
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    const subscription = session.subscription as Stripe.Subscription | null
    const customer = session.customer as Stripe.Customer | null

    // Resolve clerk user id and tier from metadata
    const clerkUserId = (
      (session.metadata?.clerkUserId as string | undefined) ||
      (customer && typeof (customer as Stripe.Customer).metadata?.clerkUserId === 'string'
        ? ((customer as Stripe.Customer).metadata.clerkUserId as string)
        : undefined) ||
      ''
    )
    const tier = (session.metadata?.tier || 'starter') as 'free' | 'starter' | 'pro' | 'enterprise'

    // Map Stripe status to our status
    let subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due' = 'inactive'
    if (subscription) {
      switch (subscription.status) {
        case 'active':
          subscriptionStatus = 'active'
          break
        case 'past_due':
          subscriptionStatus = 'past_due'
          break
        case 'canceled':
        case 'unpaid':
          subscriptionStatus = 'canceled'
          break
        default:
          subscriptionStatus = 'inactive'
      }
    }

    // Optionally persist to Convex if available and we have a clerk id
    if (convex && clerkUserId) {
      try {
        await convex.mutation(api.users.updateUserSubscription, {
          clerkId: clerkUserId,
          subscriptionTier: tier === 'free' ? 'starter' : tier, // avoid free via checkout
          subscriptionStatus,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : customer?.id,
          stripeSubscriptionId: subscription?.id || undefined,
        })
      } catch (err) {
        console.error('Convex update failed (confirm-session):', err)
      }
    }

    return NextResponse.json({
      ok: true,
      tier,
      status: subscriptionStatus,
      sessionId,
    })
  } catch (error) {
    console.error('Error confirming session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


