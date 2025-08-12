import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    console.log('🚀 AuthProvider mounted')
    
    // Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session:', session ? 'Found' : 'None')
      const { setSession, setUser } = useAuthStore.getState()
      setSession(session)
      setUser(session?.user as any || null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event)
        const { setSession, setUser, checkSubscriptionStatus } = useAuthStore.getState()
        setSession(session)
        setUser(session?.user as any || null)

        // Check subscription status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔍 User signed in, checking subscription status...')
          setTimeout(() => {
            checkSubscriptionStatus()
          }, 2000) // Wait 2 seconds for user profile to be loaded
        }
      }
    )

    return () => {
      console.log('🔥 AuthProvider unmounted')
      subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}