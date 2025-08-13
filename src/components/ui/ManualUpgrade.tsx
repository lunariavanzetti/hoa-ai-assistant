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
  
  // Disabled admin check to prevent any user confusion:
  // if (user?.email !== 'v1ktor1ach124@gmail.com') {
  //   return null
  // }

  // Show refresh button for all tiers (for debugging)
  if (user?.subscription_tier && user.subscription_tier !== 'free') {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
        <div className="text-gray-700 dark:text-gray-300 text-sm mb-3">
          Current Tier: <span className="font-semibold capitalize">{user.subscription_tier}</span>
        </div>
        <button
          onClick={() => {
            refreshUserData()
            window.location.reload()
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm rounded-md transition-colors"
        >
          Refresh Tier Status
        </button>
      </div>
    )
  }

  return (
    <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
      <div className="text-blue-800 dark:text-blue-200 mb-3">
        🎉 You purchased a Pro subscription! Click to activate your Pro features:
      </div>
      
      <button
        onClick={handleUpgrade}
        disabled={upgrading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
      >
        {upgrading ? 'Upgrading...' : 'Activate Pro Features'}
      </button>

      {message && (
        <div className="mt-3 text-sm font-medium">
          {message}
        </div>
      )}
    </div>
  )
}