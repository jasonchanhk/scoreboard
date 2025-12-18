import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppNav } from '../components/AppNav'
import { UserMenu } from '../components/UserMenu'
import { ConfirmDialog } from '../components/dialog'
import { useConfirmDialog } from '../hooks/dialog'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/Toast'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const Settings: React.FC = () => {
  const { user, deleteAccount, signOut } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog()
  const { toast, showError, hideToast } = useToast()

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
      'delete'
    )
  }

  const performDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { error } = await deleteAccount()
      if (error) {
        showError(error.message || 'Failed to delete account. Please try again.')
        setDeleting(false)
      } else {
        // Account deleted successfully, sign out and redirect
        await signOut()
        navigate('/')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showError('An unexpected error occurred. Please try again.')
      setDeleting(false)
    }
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
        variant="error"
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={() => {
          hideConfirmDialog()
          performDeleteAccount()
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

