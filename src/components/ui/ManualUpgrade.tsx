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

  // Only show for the specific user who purchased subscription
  if (user?.email !== 'v1ktor1ach124@gmail.com') {
    return null
  }

  // Show refresh button if already Pro
  if (user?.subscription_tier === 'pro') {
    return (
      <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-4">
        <div className="text-green-800 dark:text-green-200 mb-3">
          ✅ You have Pro access! If you still see "Free Plan" elsewhere, click refresh:
        </div>
        <button
          onClick={() => {
            refreshUserData()
            window.location.reload()
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Refresh Pro Status
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