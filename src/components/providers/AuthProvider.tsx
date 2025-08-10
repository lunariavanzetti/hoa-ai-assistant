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
      (event, session) => {
        console.log('🔄 Auth state changed:', event)
        const { setSession, setUser } = useAuthStore.getState()
        setSession(session)
        setUser(session?.user as any || null)
      }
    )

    return () => {
      console.log('🔥 AuthProvider unmounted')
      subscription.unsubscribe()
    }
  }, [])

  return <>{children}</>
}