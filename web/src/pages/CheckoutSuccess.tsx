import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { AppNav } from '../components/AppNav'
import { UserMenu } from '../components/UserMenu'
import { HiCheckCircle } from 'react-icons/hi'

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refetch } = useSubscription()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Refetch subscription data after a short delay to allow webhook to process
    const timer = setTimeout(() => {
      refetch()
    }, 2000) // Wait 2 seconds for webhook to process

    return () => clearTimeout(timer)
  }, [sessionId, refetch])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav rightContent={<UserMenu />} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <HiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for subscribing. Your account has been upgraded.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              View Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

