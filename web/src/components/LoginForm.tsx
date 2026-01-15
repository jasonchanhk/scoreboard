import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthPageLayout, AppLogo, AuthDivider } from './auth'
import { GoogleSignInButton } from './button'
import { Toast } from './Toast'
import { useToast } from '../hooks/useToast'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import { isValidEmailFormat, hasPlusAddressing } from '../utils/emailValidation'
import { useAlertDialog } from '../hooks/dialog'
import { AlertDialog } from './dialog'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const { signInWithMagicLink } = useAuth()
  const { toast, showError, hideToast } = useToast()
  const { alert, showError: showAlertError, hideAlert } = useAlertDialog()
  const { handleGoogleSignIn } = useGoogleSignIn()

  const handleEmailBlur = useCallback(() => {
    const trimmedEmail = email.trim()
    
    // Check for plus addressing
    if (trimmedEmail && hasPlusAddressing(trimmedEmail)) {
      showAlertError(
        'Plus Addressing Not Allowed',
        'Email addresses with plus signs (e.g., user+tag@example.com) are not allowed. Please use your regular email address.'
      )
      setEmailError(true)
      return
    }

    // Basic email format validation
    if (trimmedEmail && !isValidEmailFormat(trimmedEmail)) {
      showError('Please enter a valid email address')
      setEmailError(true)
      return
    }

    // Clear error if email is valid
    if (trimmedEmail && isValidEmailFormat(trimmedEmail) && !hasPlusAddressing(trimmedEmail)) {
      setEmailError(false)
    }
  }, [email, showAlertError, showError])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailError(false)

    const trimmedEmail = email.trim()

    // Validate email format
    if (!trimmedEmail || !isValidEmailFormat(trimmedEmail)) {
      showError('Please enter a valid email address')
      setEmailError(true)
      setLoading(false)
      return
    }

    // Check for plus addressing
    if (hasPlusAddressing(trimmedEmail)) {
      showAlertError(
        'Plus Addressing Not Allowed',
        'Email addresses with plus signs (e.g., user+tag@example.com) are not allowed. Please use your regular email address.'
      )
      setEmailError(true)
      setLoading(false)
      return
    }

    const { error } = await signInWithMagicLink(trimmedEmail)
    
    if (error) {
      showError(error.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }, [email, signInWithMagicLink, showError, showAlertError])

  if (success) {
    return (
      <AuthPageLayout>
        <div className="text-center">
          <AppLogo />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a magic link. Please check your email and click the link to sign in or create your account.
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setEmail('')
            }}
            className="mt-4 font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <AlertDialog
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={hideAlert}
      />
      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div>
        <AppLogo />
        <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
          Sign in or create an account
        </h2>
      </div>
      <div className="mt-8 space-y-6">
        <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
        <AuthDivider />
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`appearance-none relative block w-full px-3 py-2 border ${
                emailError ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                // Clear error state when user starts typing
                if (emailError) {
                  const trimmed = e.target.value.trim()
                  if (trimmed && isValidEmailFormat(trimmed) && !hasPlusAddressing(trimmed)) {
                    setEmailError(false)
                  }
                }
              }}
              onBlur={handleEmailBlur}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 cursor-pointer border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending magic link...' : 'Send magic link'}
          </button>
        </div>
      </form>
    </AuthPageLayout>
  )
}
