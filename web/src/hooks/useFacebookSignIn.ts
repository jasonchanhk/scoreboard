import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './useToast'

/**
 * Shared hook for handling Facebook sign-in with error handling
 */
export const useFacebookSignIn = () => {
  const { signInWithFacebook } = useAuth()
  const { showError } = useToast()

  const handleFacebookSignIn = useCallback(async () => {
    const { error } = await signInWithFacebook()
    if (error) {
      console.error('Facebook sign in error:', error)
      showError(error.message)
    }
  }, [signInWithFacebook, showError])

  return { handleFacebookSignIn }
}
