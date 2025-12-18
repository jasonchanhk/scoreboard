import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoginForm } from '../components/LoginForm'
import { SignUpForm } from '../components/SignUpForm'
import { LoadingSpinner } from '../components/LoadingSpinner'

export const AuthPage: React.FC = () => {
  const { user, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)

  // Redirect to dashboard if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return isSignUp ? (
    <SignUpForm onToggleMode={() => setIsSignUp(false)} />
  ) : (
    <LoginForm onToggleMode={() => setIsSignUp(true)} />
  )
}

