// api/stripe/webhook.ts - Stripe webhook handler
// Processes subscription events and updates user plans

import { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import Stripe from 'stripe'
import { 
  getUserByEmail, 
  updateUserPlan, 
  updateUserStripeCustomer,
  createSubscription,
  updateSubscriptionStatus 
} from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-08-01' 
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sig = req.headers['stripe-signature'] as string
    const rawBody = await buffer(req)
    
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        rawBody, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}

// =============================================
// EVENT HANDLERS
// =============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_email
    
    if (!customerEmail) {
      console.error('No customer email in checkout session')
      return
    }

    // Find user by email
    const user = await getUserByEmail(customerEmail)
    if (!user) {
      console.error(`User not found for email: ${customerEmail}`)
      return
    }

    // Update user with Stripe customer ID
    if (session.customer) {
      await updateUserStripeCustomer(user.id, session.customer as string)
    }

    console.log(`Checkout completed for user ${user.id} (${customerEmail})`)
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    
    if (!customer.email) {
      console.error('No email found for customer')
      return
    }

    const user = await getUserByEmail(customer.email)
    if (!user) {
      console.error(`User not found for email: ${customer.email}`)
      return
    }

    // Determine plan from subscription
    const plan = getPlanFromSubscription(subscription)
    
    // Create subscription record
    await createSubscription(
      user.id,
      subscription.id,
      plan,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    )

    console.log(`Subscription created for user ${user.id}: ${plan}`)
  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const plan = getPlanFromSubscription(subscription)
    
    await updateSubscriptionStatus(
      subscription.id,
      subscription.status,
      plan
    )

    console.log(`Subscription updated: ${subscription.id} -> ${subscription.status}`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Downgrade user to BASIC when subscription is cancelled
    await updateSubscriptionStatus(subscription.id, 'canceled', 'BASIC')
    
    console.log(`Subscription cancelled: ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
      await handleSubscriptionUpdated(subscription)
    }
    
    console.log(`Payment succeeded for invoice: ${invoice.id}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment failed for invoice: ${invoice.id}`)
    
    // TODO: Implement payment failure handling
    // - Send notification to user
    // - Potentially downgrade plan after grace period
    // - Log for manual review
    
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function getPlanFromSubscription(subscription: Stripe.Subscription): 'BASIC' | 'MAX' | 'BEAST' {
  // Extract plan from subscription metadata or price ID
  const plan = subscription.metadata?.plan
  
  if (plan && ['BASIC', 'MAX', 'BEAST'].includes(plan)) {
    return plan as 'BASIC' | 'MAX' | 'BEAST'
  }

  // Fallback: determine from price ID
  const priceId = subscription.items.data[0]?.price?.id
  
  if (priceId) {
    if (priceId.includes('beast') || priceId.includes('premium')) return 'BEAST'
    if (priceId.includes('max') || priceId.includes('pro')) return 'MAX'
  }
  
  return 'BASIC'
}
