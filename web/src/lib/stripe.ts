import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

let stripePromise: ReturnType<typeof loadStripe> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripePublishableKey) {
      throw new Error('Missing Stripe publishable key')
    }
    stripePromise = loadStripe(stripePublishableKey)
  }
  return stripePromise
}

/**
 * Creates a Stripe Checkout session using Supabase Edge Function
 * The Edge Function handles:
 * 1. User authentication verification
 * 2. Stripe Checkout Session creation
 * 3. Returns the session ID and URL
 */
export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string | undefined,
  tier: string
): Promise<{ sessionId: string; url: string | null }> => {
  // Get the current session to include auth token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('Not authenticated. Please sign in to continue.')
  }

  // Get Supabase URL and anon key for Edge Function endpoint
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL')
  }

  // Call Supabase Edge Function
  const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      priceId,
      tier,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/checkout/cancel`,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create checkout session' }))
    throw new Error(errorData.error || errorData.message || 'Failed to create checkout session')
  }

  return response.json()
}

