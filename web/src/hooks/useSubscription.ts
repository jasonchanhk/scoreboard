import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired'
  plan_tier: 'basic' | 'plus' | 'premium'
  billing_period: 'monthly' | 'yearly'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  payment_method_last4: string | null
  payment_method_brand: string | null
  created_at: string
  updated_at: string
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setSubscription(null)
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // If no subscription found, user is on basic plan
        if (fetchError.code === 'PGRST116') {
          setSubscription(null)
        } else {
          setError(fetchError.message)
        }
      } else {
        setSubscription(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { subscription, loading, error, refetch: fetchSubscription }
}

