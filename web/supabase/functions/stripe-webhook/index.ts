// Supabase Edge Function to handle Stripe webhooks
// This function processes Stripe events and updates the subscriptions table
// Based on: https://supabase.com/docs/guides/functions/examples/stripe-webhooks

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// This is needed in order to use the Web Crypto API in Deno
const cryptoProvider = Stripe.createSubtleCryptoProvider()

console.log('Stripe Webhook Handler initialized')

Deno.serve(async (request) => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the webhook signature from headers
    const signature = request.headers.get('Stripe-Signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe-Signature header' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the webhook secret
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the raw body (must use .text() for signature verification)
    const body = await request.text()

    // Verify the webhook signature using async method with crypto provider
    // Required for Deno environment
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`🔔 Event received: ${event.id}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session, stripe)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(supabase, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabase, invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process webhook' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleCheckoutCompleted(
  supabase: any,
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  
  // Try to get userId from session metadata first, then from subscription metadata
  let userId = session.metadata?.userId
  let tier = session.metadata?.tier || 'basic'

  if (!subscriptionId) {
    console.error('Missing subscriptionId in checkout session')
    return
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  // If userId not in session metadata, try subscription metadata
  if (!userId) {
    userId = subscription.metadata?.userId
    tier = subscription.metadata?.tier || tier
  }

  if (!userId) {
    console.error('Missing userId in checkout session and subscription metadata')
    console.error('Session metadata:', session.metadata)
    console.error('Subscription metadata:', subscription.metadata)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) {
    console.error('Missing priceId in subscription')
    return
  }

  // Determine billing period from price
  const price = await stripe.prices.retrieve(priceId)
  const billingPeriod = price.recurring?.interval === 'year' ? 'yearly' : 'monthly'

  // Get payment method if available
  let paymentMethodLast4 = null
  let paymentMethodBrand = null
  if (subscription.default_payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method as string
      )
      paymentMethodLast4 = paymentMethod.card?.last4 || null
      paymentMethodBrand = paymentMethod.card?.brand || null
    } catch (err) {
      console.error('Error retrieving payment method:', err)
    }
  }

  console.log('Upserting subscription:', {
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    plan_tier: tier,
    billing_period: billingPeriod,
    status: subscription.status,
  })

  // Upsert subscription
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: subscription.status,
      plan_tier: tier,
      billing_period: billingPeriod,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_method_last4: paymentMethodLast4,
      payment_method_brand: paymentMethodBrand,
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error upserting subscription:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('Successfully upserted subscription:', data)
  }
}

async function handleSubscriptionUpdate(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id
  if (!priceId) {
    console.error('Missing priceId in subscription update')
    return
  }

  const tier = subscription.metadata?.tier || 'basic'
  
  // Determine billing period from price
  const price = await subscription.items.data[0]?.price
  const billingPeriod = price?.recurring?.interval === 'year' 
    ? 'yearly' 
    : 'monthly'

  // Get payment method if available
  let paymentMethodLast4 = null
  let paymentMethodBrand = null
  if (subscription.default_payment_method) {
    try {
      // Note: We'd need Stripe instance here, but for updates we can skip if not critical
    } catch (err) {
      console.error('Error retrieving payment method:', err)
    }
  }

  console.log('Updating subscription:', {
    stripe_subscription_id: subscription.id,
    plan_tier: tier,
    status: subscription.status,
  })

  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      status: subscription.status,
      plan_tier: tier,
      billing_period: billingPeriod,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
  } else {
    console.log('Successfully updated subscription')
  }
}

async function handleSubscriptionDeleted(
  supabase: any,
  subscription: Stripe.Subscription
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  }
}

async function handlePaymentSucceeded(
  supabase: any,
  invoice: Stripe.Invoice
) {
  if (invoice.subscription) {
    const subscriptionId = invoice.subscription as string
    
    // Update subscription status to active
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription after payment:', error)
    }
  }
}

async function handlePaymentFailed(
  supabase: any,
  invoice: Stripe.Invoice
) {
  if (invoice.subscription) {
    const subscriptionId = invoice.subscription as string
    
    // Update subscription status to past_due
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription after failed payment:', error)
    }
  }
}

