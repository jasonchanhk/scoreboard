import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { identifyUser } from '../lib/logrocket'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithMagicLink: (email: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signInWithFacebook: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const sessionRef = useRef<Session | null>(null)

  useEffect(() => {
    let mounted = true
    let initialSessionSet = false

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      sessionRef.current = session
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      initialSessionSet = true

      // Identify user in LogRocket if already logged in
      if (session?.user) {
        identifyUser(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name || session.user.user_metadata?.name
        )
      }
    })

    // Listen for auth changes (includes OAuth callbacks)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return

      const currentSession = sessionRef.current
      // Only update if the session actually changed (different user ID or null state)
      const currentUserId = currentSession?.user?.id ?? null
      const newUserId = newSession?.user?.id ?? null
      const sessionChanged = currentUserId !== newUserId || 
                            currentSession?.access_token !== newSession?.access_token

      // Only log and update for meaningful state changes
      // Skip TOKEN_REFRESHED events if user hasn't changed
      if (event === 'TOKEN_REFRESHED' && !sessionChanged && initialSessionSet) {
        // Silently update session for token refresh without logging
        sessionRef.current = newSession
        setSession(newSession)
        return
      }

      if (sessionChanged || !initialSessionSet) {
        console.log('Auth state changed:', event, newSession?.user?.email)
        sessionRef.current = newSession
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        // Identify user in LogRocket when they sign in
        if (newSession?.user) {
          identifyUser(
            newSession.user.id,
            newSession.user.email,
            newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name
          )
        }

        // Clean up hash fragment after OAuth callback
        // Supabase adds a hash fragment with auth data that we need to remove after processing
        if (event === 'SIGNED_IN' && window.location.hash) {
          // Remove the hash fragment from URL without causing a page reload
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithMagicLink = async (email: string) => {
    console.log('Attempting to send magic link to:', email)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    
    if (error) {
      console.error('Magic link error:', error)
    } else {
      console.log('Magic link sent successfully')
    }
    
    return { error }
  }

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { error }
  }

  const signInWithFacebook = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const deleteAccount = async () => {
    try {
      // Get current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        return { error: { message: 'No active session. Please sign in again.' } }
      }

      // Use Edge Function to delete account (requires admin privileges)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) {
        return { error: { message: 'Missing Supabase configuration' } }
      }

      const functionUrl = `${supabaseUrl}/functions/v1/delete-account`
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete account' }))
        return { error: { message: errorData.error || 'Failed to delete account' } }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Unexpected error in deleteAccount:', error)
      return { error: { message: error.message || 'An unexpected error occurred while deleting your account.' } }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithMagicLink,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
