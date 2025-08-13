import React, { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

export const ManualUpgrade: React.FC = () => {
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState('')
  const { user, setUser, refreshUserData } = useAuthStore()

  const handleUpgrade = async () => {
    if (!user?.email) return

    try {
      setUpgrading(true)
      setMessage('')

      console.log('🔄 Upgrading user to Pro:', user.email)

      const { data, error } = await supabase
        .from('users')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
          paddle_subscription_id: 'manual_upgrade_' + Date.now(),
          updated_at: new Date().toISOString()
        })
        .eq('email', user.email)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setUser(data)
        setMessage('✅ Successfully upgraded to Pro!')
        console.log('✅ User upgraded to Pro:', data)
        
        // Also refresh user data to make sure everything is in sync
        setTimeout(() => {
          refreshUserData()
        }, 1000)
      }

    } catch (error) {
      console.error('❌ Upgrade failed:', error)
      setMessage('❌ Upgrade failed: ' + (error as Error).message)
    } finally {
      setUpgrading(false)
    }
  }

  // ADMIN ONLY: This component is only for debugging/testing purposes
  // Regular users should NEVER see this - their Pro features activate automatically via Paddle webhooks
  // COMPLETELY HIDE from all users for now to prevent confusion
  return null
}