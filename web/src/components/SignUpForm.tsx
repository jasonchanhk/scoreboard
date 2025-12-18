import React, { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthPageLayout, AppLogo, AuthDivider, AuthToggleLink } from './auth'
import { GoogleSignInButton } from './button'
import { PasswordInput } from './input'
import { AlertDialog } from './dialog'
import { useAlertDialog } from '../hooks/dialog'
import { Toast } from './Toast'
import { useToast } from '../hooks/useToast'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import { isValidEmailFormat, hasPlusAddressing } from '../utils/emailValidation'

interface SignUpFormProps {
  onToggleMode: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const { alert, showError: showAlertError, hideAlert } = useAlertDialog()
  const { toast, showError, hideToast } = useToast()
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

    if (password !== confirmPassword) {
      showError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await signUp(trimmedEmail, password)
    
    if (error) {
      showError(error.message)
    } else {
      setSuccess(true)
    }
    
    setLoading(false)
  }, [email, password, confirmPassword, signUp, showError, showAlertError])


  if (success) {
    return (
      <AuthPageLayout>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a confirmation link. Please check your email and click the link to verify your account.
          </p>
          <button
            onClick={onToggleMode}
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
          Create your account
        </h2>
      </div>
      <div className="mt-8 space-y-6">
        <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
        <AuthDivider />
      </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
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
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  emailError ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
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
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        <AuthToggleLink prompt="Already have an account?" linkText="Sign in" onToggle={onToggleMode} />
    </AuthPageLayout>
  )
}
