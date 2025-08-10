import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use getState() directly to avoid dependency issues

  useEffect(() => {
    let mounted = true
    let initialized = false

    const initializeAuth = async () => {
      if (initialized) {
        console.log('🔄 Auth already initialized, skipping')
        return
      }
      
      initialized = true
      
      try {
        const { setLoading, setSession, setUser } = useAuthStore.getState()
        setLoading(true)
        console.log('🔐 Initializing auth...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        console.log('📋 Initial session:', session ? 'Found' : 'None')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user as any || null)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          const { setSession, setUser, setLoading } = useAuthStore.getState()
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    // Initialize auth only once
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session')
        
        if (mounted) {
          const { setSession, setUser, setLoading } = useAuthStore.getState()
          setSession(session)
          setUser(session?.user as any || null)
          
          // Always set loading to false on auth state changes
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove dependencies to prevent re-initialization

  return <>{children}</>
}