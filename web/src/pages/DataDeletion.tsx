import React from 'react'
import { Link } from 'react-router-dom'
import { SEOHead } from '../components/SEOHead'
import { Button } from '../components/button'

export const DataDeletion: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Data Deletion Instructions - Pretty Scoreboard"
        description="Learn how to delete your account and all associated data from Pretty Scoreboard. Follow these simple steps to permanently remove your information."
        canonical="https://prettyscoreboard.com/data-deletion"
      />
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Data Deletion Instructions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">How to Delete Your Account and Data</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you would like to delete your Pretty Scoreboard account and all associated data, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-4 text-gray-700">
              <li>
                <strong>Sign in to your account:</strong> Make sure you are logged in to your Pretty Scoreboard account.
              </li>
              <li>
                <strong>Navigate to Settings:</strong> Click on your profile menu in the top right corner and select "Settings".
              </li>
              <li>
                <strong>Find the Delete Account section:</strong> Scroll down to the "Delete Account" section at the bottom of the Settings page.
              </li>
              <li>
                <strong>Click "Delete Account":</strong> Click the red "Delete Account" button. You will be asked to confirm this action.
              </li>
              <li>
                <strong>Confirm deletion:</strong> Confirm that you want to permanently delete your account. This action cannot be undone.
              </li>
            </ol>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once you confirm, your account and all associated data will be permanently deleted, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Your user account and profile information</li>
              <li>All scoreboards you have created</li>
              <li>All game data, scores, and statistics</li>
              <li>Any subscription information</li>
            </ul>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <p className="text-indigo-900 font-semibold mb-2">⚠️ Important:</p>
              <p className="text-indigo-800 text-sm">
                Account deletion is permanent and cannot be undone. Make sure you have exported or saved any data you want to keep before deleting your account.
              </p>
            </div>
            <div className="mt-6">
              <Button
                to="/settings"
                variant="primary"
                size="md"
              >
                Go to Settings
              </Button>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Alternative: Contact Us</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are unable to access your account or need assistance with account deletion, you can contact us directly:
            </p>
            <div className="mt-4">
              <Button
                to="/contact"
                variant="secondary"
                size="md"
              >
                Contact Support
              </Button>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Data Deletion for OAuth Users</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you signed in using Google or Facebook OAuth, you can also request account deletion through this page. 
              When you delete your account through our platform, we will remove all your data from our systems.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Note: Deleting your account here will not automatically delete your Google or Facebook account. 
              If you wish to delete your Google or Facebook account, you must do so through their respective platforms.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Questions?</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about data deletion or our privacy practices, please review our{' '}
              <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">
                Privacy Policy
              </Link>
              {' '}or{' '}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
