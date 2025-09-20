import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, type User } from '@/lib/supabase'
import type { AuthError, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'apple') => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateUser: (updates: { data?: { full_name?: string } }) => Promise<void>
  checkSubscriptionStatus: () => Promise<void>
  refreshUserData: () => Promise<void>
  startTokenPolling: () => void
  stopTokenPolling: () => void
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false, // Remove loading state complexity
      error: null,

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null })
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error

          if (data.user) {
            // Fetch user profile from our users table
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()

            if (profileError) throw profileError

            set({ 
              user: profile, 
              session: data.session,
              loading: false 
            })

            // Automatically check subscription status after sign in
            setTimeout(() => {
              get().checkSubscriptionStatus()
            }, 1000)
          }
        } catch (error) {
          set({ 
            error: (error as AuthError).message, 
            loading: false 
          })
          throw error
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        try {
          set({ loading: true, error: null })
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          })

          if (error) throw error

          if (data.user) {
            // Create user profile in our users table
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                subscription_tier: 'free',
                tokens: 0 // Start with 0 tokens
              })
              .select()
              .single()

            if (profileError) throw profileError

            console.log('=== 👤 NEW USER CREATED ===')
            console.log('📧 Email:', profile.email)
            console.log('📊 Initial tokens:', profile.tokens)
            console.log('🎯 Initial tier:', profile.subscription_tier)
            console.log('🆔 User ID:', profile.id)

            set({
              user: profile,
              session: data.session,
              loading: false
            })
            console.log('✅ User signed up successfully')
          }
        } catch (error) {
          set({ 
            error: (error as AuthError).message, 
            loading: false 
          })
          throw error
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null })
          
          console.log('Signing out user...')
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          // Clear all state
          set({ 
            user: null, 
            session: null, 
            loading: false,
            error: null
          })
          
          // Force clear localStorage
          localStorage.removeItem('auth-storage')
          
          console.log('Sign out successful')
          
        } catch (error) {
          console.error('Sign out error:', error)
          set({ 
            error: (error as AuthError).message, 
            loading: false 
          })
          throw error
        }
      },

      signInWithProvider: async (provider: 'google' | 'apple') => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })

          if (error) throw error

        } catch (error) {
          set({ 
            error: (error as AuthError).message, 
            loading: false 
          })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          })

          if (error) throw error

          set({ loading: false })
        } catch (error) {
          set({ 
            error: (error as AuthError).message, 
            loading: false 
          })
          throw error
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get()
          if (!user) throw new Error('No user logged in')

          set({ loading: true, error: null })

          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

          if (error) throw error

          set({ 
            user: data, 
            loading: false 
          })
        } catch (error) {
          set({ 
            error: (error as Error).message, 
            loading: false 
          })
          throw error
        }
      },

      updateUser: async (updates: { data?: { full_name?: string } }) => {
        try {
          const { user } = get()
          if (!user) throw new Error('No user logged in')

          set({ loading: true, error: null })

          // Create a timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Update timeout after 10 seconds'))
            }, 10000)
          })

          // Update Supabase auth user metadata with timeout
          const updatePromise = supabase.auth.updateUser(updates)
          const { error } = await Promise.race([updatePromise, timeoutPromise])
          if (error) throw error

          // Update our local user data as well
          if (updates.data?.full_name) {
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .update({ full_name: updates.data.full_name })
              .eq('id', user.id)
              .select()
              .single()

            if (profileError) {
              console.warn('Profile update failed, but auth metadata updated:', profileError)
            }
            
            set({ 
              user: profileData || { ...user, full_name: updates.data.full_name }, 
              loading: false 
            })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('UpdateUser error:', error)
          set({ 
            error: (error as Error).message, 
            loading: false 
          })
          throw error
        }
      },

      checkSubscriptionStatus: async () => {
        try {
          const { user } = get()
          if (!user?.email) return

          console.log('🔄 Checking subscription status for:', user.email)

          // Check with Paddle backend to see if user has active subscription
          const response = await fetch('/api/check-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email })
          })

          if (response.ok) {
            const result = await response.json()
            
            if (result.hasActiveSubscription && result.subscriptionTier !== user.subscription_tier) {
              console.log('🎉 Found active subscription! Upgrading user to:', result.subscriptionTier)
              
              // Update user in database
              const { data, error } = await supabase
                .from('users')
                .update({
                  subscription_tier: result.subscriptionTier,
                  subscription_status: 'active',
                  paddle_customer_id: result.paddleCustomerId,
                  paddle_subscription_id: result.paddleSubscriptionId,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single()

              if (!error && data) {
                set({ user: data })
                console.log('✅ User automatically upgraded to:', result.subscriptionTier)
              }
            }
          }
        } catch (error) {
          console.error('❌ Error checking subscription status:', error)
        }
      },

      refreshUserData: async () => {
        try {
          const { session } = get()
          if (!session?.user) return

          console.log('🔄 Refreshing user data from database...')

          // Fetch fresh user data from database
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('❌ Error refreshing user data:', error)
            return
          }

          if (profile) {
            // Log detailed token and tier information
            console.log('✅ User data refreshed:')
            console.log('📊 TOKENS:', profile.tokens || 0)
            console.log('🎯 TIER:', profile.subscription_tier || 'free')
            console.log('📅 STATUS:', profile.subscription_status || 'inactive')
            console.log('🆔 USER ID:', profile.id)
            console.log('📧 EMAIL:', profile.email)
            console.log('⏰ UPDATED:', profile.updated_at)

            set({ user: profile })
          }
        } catch (error) {
          console.error('❌ Error refreshing user data:', error)
        }
      },

      startTokenPolling: () => {
        const { stopTokenPolling } = get()
        stopTokenPolling() // Clear any existing polling

        console.log('🔄 Starting token polling...')
        const interval = setInterval(() => {
          const { refreshUserData } = get()
          refreshUserData()
        }, 3000) // Poll every 3 seconds

        // Store interval ID in a closure or global
        ;(globalThis as any).tokenPollingInterval = interval
      },

      stopTokenPolling: () => {
        const interval = (globalThis as any).tokenPollingInterval
        if (interval) {
          console.log('⏹️ Stopping token polling...')
          clearInterval(interval)
          ;(globalThis as any).tokenPollingInterval = null
        }
      },

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        // Only persist user info, not session or loading state
        // Session and loading should be managed by Supabase directly
        user: state.user
      })
    }
  )
)

// Remove this duplicate listener - it's handled in AuthProvider now