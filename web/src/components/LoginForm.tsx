import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthPageLayout } from './auth'
import { GoogleSignInButton, FacebookSignInButton } from './button'
import { TextInput } from './input/TextInput'
import { Toast } from './Toast'
import { useToast } from '../hooks/useToast'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import { useFacebookSignIn } from '../hooks/useFacebookSignIn'
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
  const { handleFacebookSignIn } = useFacebookSignIn()

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
        <div 
        className="bg-white rounded-3xl w-full max-w-md border border-gray-200"
        style={{ boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)' }}
      >
        <p className="text-sm font-semibold text-gray-900 text-center border-b border-gray-200 py-4">
            Log in or sign up
          </p>
        <div className="p-8">
          <div className="mb-8 -mx-8 px-8">
            <h2 className="text-xl font-semibold tracking-tight text-grey-900">
              Welcome to
              <br />
              <span className="flex items-center gap-2 text-3xl font-bold pt-1">
                <img 
                  src="/logo.png" 
                  alt="Pretty Scoreboard" 
                  className="w-10 h-10 shrink-0"
                />
                Pretty Scoreboard
              </span>
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-grey-900">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent you a magic link. Please check your email and click the link to sign in or create your account.
              </p>
            </div>
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              Back to sign in
            </button>
          </div>
        </div>  
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
      <div 
        className="bg-white rounded-3xl w-full max-w-md border border-gray-200"
        style={{ boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)' }}
      >
        <p className="text-sm font-semibold text-gray-900 text-center border-b border-gray-200 py-4">
            Log in or sign up
          </p>
        <div className="p-8">
        <div className="mb-8 -mx-8 px-8">
          
          <h2 className="text-xl font-semibold tracking-tight text-grey-900">
            Welcome to
            <br />
            <span className="flex items-center gap-2 text-3xl font-bold pt-1">
              <img 
                src="/logo.png" 
                alt="Pretty Scoreboard" 
                className="w-10 h-10 shrink-0"
              />
              Pretty Scoreboard
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
          <FacebookSignInButton onClick={handleFacebookSignIn} disabled={true} />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <TextInput
            label="Email address"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              // Clear error state when user starts typing
              if (emailError) {
                const trimmed = value.trim()
                if (trimmed && isValidEmailFormat(trimmed) && !hasPlusAddressing(trimmed)) {
                  setEmailError(false)
                }
              }
            }}
            onBlur={handleEmailBlur}
            placeholder="Email address"
            required
            id="email"
            autoComplete="email"
            disabled={loading}
          />

          <div className="text-xs text-gray-600">
            We'll send you a magic link to confirm your email. Standard message and data rates apply.{' '}
            <a href="/privacy" className="underline hover:text-gray-900">
              Privacy Policy
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base cursor-pointer"
          >
            {loading ? 'Sending magic link...' : 'Continue'}
          </button>
        </form>
      </div>
      </div>
    </AuthPageLayout>
  )
}
