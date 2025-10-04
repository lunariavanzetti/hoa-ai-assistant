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

            // Log user details after login
            console.log('🔐 USER AUTHENTICATED:', {
              email: profile.email,
              subscription_tier: profile.subscription_tier || 'free',
              subscription_status: profile.subscription_status || 'none',
              video_credits: profile.video_credits || 0,
              usage_stats: profile.usage_stats,
              total_tokens: profile.usage_stats?.credits_remaining || profile.video_credits || 0
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
                video_credits: 0, // Start with 0 video credits
                usage_stats: {
                  credits_remaining: 0,
                  videos_this_month: 0,
                  total_videos_generated: 0,
                  pay_per_video_purchases: 0
                }
              })
              .select()
              .single()

            if (profileError) throw profileError


            set({
              user: profile,
              session: data.session,
              loading: false
            })
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
          const currentUser = get().user
          console.log('🚪 USER LOGGING OUT:', {
            email: currentUser?.email,
            subscription_tier: currentUser?.subscription_tier,
            tokens: currentUser?.usage_stats?.credits_remaining || currentUser?.video_credits || 0
          })

          set({ loading: true, error: null })

          const { error } = await supabase.auth.signOut()
          if (error) {
            console.log('❌ SIGN OUT FAILED:', error.message)
            throw error
          }

          console.log('✅ SUPABASE SIGN OUT SUCCESSFUL')

          // Clear all state
          set({
            user: null,
            session: null,
            loading: false,
            error: null
          })

          // Force clear localStorage
          localStorage.removeItem('auth-storage')
          console.log('🗑️ LOCAL STORAGE CLEARED')

          console.log('✅ USER LOGGED OUT SUCCESSFULLY')

        } catch (error) {
          console.log('❌ LOGOUT ERROR:', error)
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
            }
            
            set({ 
              user: profileData || { ...user, full_name: updates.data.full_name }, 
              loading: false 
            })
          } else {
            set({ loading: false })
          }
        } catch (error) {
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
              }
            }
          }
        } catch (error) {
        }
      },

      refreshUserData: async () => {
        try {
          const { session } = get()
          if (!session?.user) return


          // Fetch fresh user data from database
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            return
          }

          if (profile) {
            const currentUser = get().user
            const newTokens = profile.usage_stats?.credits_remaining || profile.video_credits || 0
            const oldTokens = currentUser?.usage_stats?.credits_remaining || currentUser?.video_credits || 0

            // Log if tokens changed AND it's an increase (subscription purchase detected)
            // Don't log on initial load when oldTokens is undefined
            if (currentUser && newTokens > oldTokens) {
              console.log('💰 TOKENS ADDED - SUBSCRIPTION PURCHASED:', {
                email: profile.email,
                old_tokens: oldTokens,
                new_tokens: newTokens,
                tokens_added: newTokens - oldTokens,
                subscription_tier: profile.subscription_tier || 'free',
                subscription_status: profile.subscription_status
              })
            } else if (currentUser && newTokens < oldTokens) {
              console.log('🎬 TOKEN USED - VIDEO GENERATED:', {
                email: profile.email,
                old_tokens: oldTokens,
                new_tokens: newTokens,
                tokens_used: oldTokens - newTokens
              })
            }

            set({ user: profile })
          }
        } catch (error) {
        }
      },

      startTokenPolling: () => {
        const { stopTokenPolling } = get()
        stopTokenPolling() // Clear any existing polling

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