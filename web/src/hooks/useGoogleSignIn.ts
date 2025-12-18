import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from './useToast'

/**
 * Shared hook for handling Google sign-in with error handling
 */
export const useGoogleSignIn = () => {
  const { signInWithGoogle } = useAuth()
  const { showError } = useToast()

  const handleGoogleSignIn = useCallback(async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      console.error('Google sign in error:', error)
      showError(error.message)
    }
  }, [signInWithGoogle, showError])

  return { handleGoogleSignIn }
}

