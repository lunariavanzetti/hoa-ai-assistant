import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Auth state is already being managed by the Zustand store
    // and the Supabase auth state listener
    setLoading(false)
  }, [setLoading])

  return <>{children}</>
}