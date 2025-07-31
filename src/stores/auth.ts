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
      loading: false,
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
                subscription_tier: 'free'
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
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signOut()
          if (error) throw error

          set({ 
            user: null, 
            session: null, 
            loading: false 
          })
        } catch (error) {
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

      setUser: (user: User | null) => set({ user }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, session: state.session })
    }
  )
)

// Initialize auth state listener
supabase.auth.onAuthStateChange(async (_event, session) => {
  const { setUser, setSession, setLoading } = useAuthStore.getState()
  
  setLoading(true)
  setSession(session)

  if (session?.user) {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUser(profile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  } else {
    setUser(null)
  }
  
  setLoading(false)
})