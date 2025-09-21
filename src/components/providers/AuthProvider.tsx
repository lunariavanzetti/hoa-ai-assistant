import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    
    // Get initial session immediately
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const { setSession, setUser, refreshUserData } = useAuthStore.getState()
      setSession(session)
      setUser(session?.user as any || null)
      
      // Refresh user data from database if user is logged in
      if (session?.user) {
        setTimeout(() => {
          refreshUserData()
        }, 1000)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const { setSession, setUser, checkSubscriptionStatus } = useAuthStore.getState()
        setSession(session)
        setUser(session?.user as any || null)

        // Check subscription status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            checkSubscriptionStatus()
          }, 2000) // Wait 2 seconds for user profile to be loaded
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}