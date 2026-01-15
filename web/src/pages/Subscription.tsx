import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AppNav } from '../components/AppNav'
import { UserMenu } from '../components/UserMenu'
import { Toast } from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { useSubscription } from '../hooks/useSubscription'
import { createCheckoutSession } from '../lib/stripe'
import { HiCheck } from 'react-icons/hi'

type SubscriptionTier = 'basic' | 'plus' | 'premium'
type BillingPeriod = 'monthly' | 'yearly'

interface Tier {
  id: SubscriptionTier
  name: string
  priceMonthly: string
  priceYearly: string
  priceIdMonthly: string // Stripe Price ID for monthly (starts with price_)
  priceIdYearly: string // Stripe Price ID for yearly (starts with price_)
  features: string[] // All features for this tier
  popular?: boolean
}

const tiers: Tier[] = [
  {
    id: 'basic',
    name: 'Basic',
    priceMonthly: 'Free',
    priceYearly: 'Free',
    priceIdMonthly: 'free', // No Stripe price ID needed for free tier
    priceIdYearly: 'free',
    features: [
      'Create up to 2 scoreboards',
      'Public viewing on 2 devices',
      'Real-time updates',
      'Share codes',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    priceMonthly: 'Coming Soon',
    priceYearly: 'Coming Soon',
    priceIdMonthly: import.meta.env.VITE_STRIPE_PLUS_PRICE_ID_MONTHLY || 'price_plus_monthly',
    priceIdYearly: import.meta.env.VITE_STRIPE_PLUS_PRICE_ID_YEARLY || 'price_plus_yearly',
    features: [
      'Create up to 50 scoreboards',
      'Public viewing on 5 devices',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 'Coming Soon',
    priceYearly: 'Coming Soon',
    priceIdMonthly: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID_MONTHLY || 'price_premium_monthly',
    priceIdYearly: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID_YEARLY || 'price_premium_yearly',
    features: [
    ],
  },
]

export const Subscription: React.FC = () => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const { toast, showError, hideToast } = useToast()

  // Set billing period based on current subscription
  React.useEffect(() => {
    if (subscription?.billing_period) {
      setBillingPeriod(subscription.billing_period)
    }
  }, [subscription])

  const handleSubscribe = async (tier: Tier) => {
    if (!user) {
      showError('Please sign in to subscribe')
      return
    }

    // Premium and Plus tiers are disabled
    if (tier.id === 'premium' || tier.id === 'plus') {
      return
    }

    // Basic plan is free - no payment needed
    if (tier.id === 'basic') {
      // TODO: Update user subscription to basic in your database
      // For now, just show a message
      showError('You are already on the Basic plan (free)')
      return
    }

    setLoading(tier.id)

    try {
      // Get the appropriate price ID based on billing period
      const priceId = billingPeriod === 'monthly' ? tier.priceIdMonthly : tier.priceIdYearly

      // Create checkout session
      const { url } = await createCheckoutSession(
        priceId,
        user.id,
        user.email,
        tier.id
      )

      // Redirect to Stripe Checkout using the session URL
      if (!url) {
        throw new Error('Failed to get checkout URL')
      }
      
      window.location.href = url
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      showError(error.message || 'Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav rightContent={<UserMenu />} />
      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 mb-6">
            Select the perfect plan for your scoreboard needs
          </p>
          
          {/* Billing Period Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all relative cursor-pointer ${
                billingPeriod === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 flex flex-col h-full ${
                tier.id === 'basic'
                  ? 'border-green-500'
                  : tier.id === 'premium' || tier.id === 'plus'
                  ? 'border-gray-300'
                  : tier.popular
                  ? 'border-indigo-600 transform scale-105'
                  : 'border-gray-200'
              } overflow-hidden ${tier.id === 'premium' || tier.id === 'plus' ? 'opacity-60' : ''}`}
            >
              {tier.id === 'basic' && (!subscription || subscription.plan_tier === 'basic') && (
                <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-1 text-xs font-semibold">
                  Current Plan
                </div>
              )}
              {subscription && subscription.plan_tier === tier.id && tier.id !== 'basic' && (
                <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-center py-1 text-xs font-semibold">
                  Current Plan
                </div>
              )}
              {!subscription && tier.popular && tier.id !== 'basic' && tier.id !== 'plus' && (
                <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-center py-1 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              {subscription && subscription.plan_tier !== tier.id && tier.popular && tier.id !== 'basic' && tier.id !== 'plus' && (
                <div className="absolute top-0 left-0 right-0 bg-indigo-600 text-white text-center py-1 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              {(tier.id === 'premium' || tier.id === 'plus') && (
                <div className="absolute top-0 left-0 right-0 bg-gray-500 text-white text-center py-1 text-xs font-semibold">
                  Coming Soon
                </div>
              )}
              
              <div className={`p-8 flex flex-col h-full ${tier.popular || tier.id === 'basic' || tier.id === 'premium' || tier.id === 'plus' ? 'pt-12' : ''}`}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly}
                    </span>
                    {tier.id !== 'basic' && tier.priceMonthly !== 'Coming Soon' && (
                      <span className="text-gray-600 ml-2">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && tier.id !== 'basic' && tier.priceYearly !== 'Coming Soon' && (
                    <p className="text-sm text-gray-500 mt-1">
                      {(tier.priceYearly.startsWith('$') ? '$' : '£')}{(parseFloat(tier.priceYearly.replace(/[£$]/g, '')) / 12).toFixed(2)} per month billed annually
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-2">
                    {tier.id === 'basic' ? 'Get started with:' : tier.id === 'plus' ? 'Everything in the Basic Plan, plus:' : ''}
                  </p>
                  <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <HiCheck className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 ${
                          tier.id === 'basic' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={
                    loading !== null || 
                    tier.id === 'premium' || 
                    tier.id === 'plus' ||
                    (tier.id === 'basic' && (!subscription || subscription.plan_tier === 'basic')) ||
                    !!(subscription && subscription.plan_tier === tier.id)
                  }
                  className={`mt-auto w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.id === 'premium' || tier.id === 'plus'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : (tier.id === 'basic' && (!subscription || subscription.plan_tier === 'basic')) ||
                    (subscription && subscription.plan_tier === tier.id)
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-not-allowed'
                      : tier.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    tier.popular ? 'focus:ring-indigo-500' : 'focus:ring-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                >
                  {loading === tier.id ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : tier.id === 'premium' || tier.id === 'plus' ? (
                    'Coming Soon'
                  ) : (tier.id === 'basic' && (!subscription || subscription.plan_tier === 'basic')) ||
                      (subscription && subscription.plan_tier === tier.id) ? (
                    'Current Plan'
                  ) : subscription && subscription.plan_tier !== 'basic' && tier.id === 'basic' ? (
                    'Downgrade'
                  ) : (
                    'Upgrade'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Basic plan is free forever. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

