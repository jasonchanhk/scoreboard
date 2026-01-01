import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppNav } from '../components/AppNav'
import { UserMenu } from '../components/UserMenu'
import { ConfirmDialog } from '../components/dialog'
import { useConfirmDialog } from '../hooks/dialog'
import { useToast } from '../hooks/useToast'
import { useSubscription } from '../hooks/useSubscription'
import { Toast } from '../components/Toast'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'

export const Settings: React.FC = () => {
  const { user, deleteAccount, signOut } = useAuth()
  const { subscription, refetch: refetchSubscription } = useSubscription()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog()
  const { toast, showError, showSuccess, hideToast } = useToast()

  // Get display name from user metadata, or fallback to first part of email
  const getDisplayName = (): string => {
    if (!user?.email) return 'User'
    
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.user_metadata?.display_name
    
    if (displayName) {
      return displayName
    }
    
    const emailPart = user.email.split('@')[0]
    return emailPart
  }

  const displayName = getDisplayName()

  const handleDeleteAccount = () => {
    showConfirmDialog(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your scoreboards and data will be permanently deleted.',
      'error'
    )
  }

  const handleCancelSubscription = () => {
    showConfirmDialog(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period, and you will continue to have access to all features until then.',
      'warning'
    )
  }

  const performCancelSubscription = async () => {
    setCanceling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showError('Not authenticated')
        setCanceling(false)
        return
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Missing Supabase URL')
      }

      const functionUrl = `${supabaseUrl}/functions/v1/cancel-subscription`
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to cancel subscription' }))
        throw new Error(errorData.error || 'Failed to cancel subscription')
      }

      showSuccess('Subscription will be canceled at the end of the current billing period')
      await refetchSubscription()
    } catch (error: any) {
      console.error('Error canceling subscription:', error)
      showError(error.message || 'Failed to cancel subscription. Please try again.')
    } finally {
      setCanceling(false)
      hideConfirmDialog()
    }
  }

  const performDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { error } = await deleteAccount()
      if (error) {
        console.error('Delete account error:', error)
        showError(error.message || 'Failed to delete account. Please try again.')
        setDeleting(false)
        hideConfirmDialog()
      } else {
        // Account deleted successfully, sign out and redirect
        hideConfirmDialog()
        await signOut()
        navigate('/')
      }
    } catch (error: any) {
      console.error('Error deleting account:', error)
      showError(error?.message || 'An unexpected error occurred. Please try again.')
      setDeleting(false)
      hideConfirmDialog()
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPlanDisplayName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1)
  }

  if (deleting) {
    return <LoadingSpinner message="Deleting your account..." />
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
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant || 'error'}
        confirmText={confirmDialog.variant === 'warning' ? 'Cancel Subscription' : 'Delete Account'}
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmDialog.variant === 'warning') {
            performCancelSubscription()
          } else {
            hideConfirmDialog()
            performDeleteAccount()
          }
        }}
        onCancel={hideConfirmDialog}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Information Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{displayName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email || 'Not available'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Subscription</h2>
          </div>
          <div className="px-6 py-5">
            {subscription ? (
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getPlanDisplayName(subscription.plan_tier)} ({subscription.billing_period})
                    {subscription.status === 'active' && subscription.cancel_at_period_end && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Cancels on {formatDate(subscription.current_period_end)}
                      </span>
                    )}
                    {subscription.status === 'past_due' && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Payment Required
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{subscription.status.replace('_', ' ')}</dd>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} On
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(subscription.current_period_end)}</dd>
                  </div>
                )}
                {subscription.payment_method_last4 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {subscription.payment_method_brand ? subscription.payment_method_brand.charAt(0).toUpperCase() + subscription.payment_method_brand.slice(1) : 'Card'} •••• {subscription.payment_method_last4}
                    </dd>
                  </div>
                )}
                {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                  <div className="mt-4">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  </div>
                )}
              </dl>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">You're currently on the Basic (free) plan.</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white shadow rounded-lg border border-red-200">
          <div className="px-6 py-5 border-b border-red-200 bg-red-50 rounded-t-lg">
            <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
            <p className="mt-1 text-sm text-red-700">
              Irreversible and destructive actions
            </p>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="ml-4 inline-flex items-center px-4 py-2 cursor-pointer border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

