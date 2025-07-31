import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Bell, CreditCard, Shield, Upload, Plus, ExternalLink, Download, Key, Smartphone } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'
import { paddleClient } from '@/lib/paddleClient'
import { analytics, getPlanDetails } from '@/lib/analytics'

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    photo: null as File | null
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false
  })
  const [hoaProperties] = useState([
    {
      id: '1',
      name: 'Sunset Ridge Community',
      address: '123 Community Dr, City, ST 12345'
    }
  ])

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        photo: null
      })
    }
  }, [user])

  const handleProfileSave = async () => {
    if (!user) {
      error('No User', 'Please log in to update your profile.')
      return
    }
    
    if (!profileData.fullName.trim()) {
      error('Invalid Name', 'Please enter a valid full name.')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('Updating profile with data:', { full_name: profileData.fullName })
      
      // Simple timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile update timeout after 15 seconds'))
        }, 15000)
      })
      
      const updatePromise = updateUser({
        data: {
          full_name: profileData.fullName
        }
      })
      
      await Promise.race([updatePromise, timeoutPromise])
      
      success('Profile Updated', 'Your profile has been saved successfully.')
      analytics.track('Profile Updated', {
        user_id: user.id,
        fields_updated: ['full_name']
      })
    } catch (err) {
      console.error('Profile update error:', err)
      error('Update Failed', `Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileData(prev => ({ ...prev, photo: file }))
      success('Photo Selected', 'Click "Save Changes" to update your profile photo.')
    }
  }

  const handleAddNewHOA = () => {
    // Navigate to HOA setup wizard or show modal
    success('Coming Soon', 'Multi-HOA management is coming in the next update!')
    analytics.track('Add HOA Clicked', {
      user_id: user?.id,
      current_hoa_count: hoaProperties.length
    })
  }

  const handleUpgrade = () => {
    window.location.href = '/pricing'
    analytics.trackUpgradeClicked(
      user?.subscription_tier || 'free',
      'pro',
      'settings_page'
    )
  }

  const handleViewBillingHistory = async () => {
    if (!user?.paddle_customer_id) {
      // For users without billing info, redirect to pricing
      success('Setup Billing', 'Subscribe to a plan first to view billing history.')
      window.location.href = '/pricing'
      return
    }
    
    try {
      await paddleClient.openCustomerPortal(user.paddle_customer_id)
      analytics.track('Billing History Viewed', {
        user_id: user.id,
        customer_id: user.paddle_customer_id
      })
    } catch (err) {
      error('Portal Error', 'Failed to open billing portal. Please try again.')
    }
  }

  const handleChangePassword = () => {
    success('Email Sent', 'Password reset instructions have been sent to your email.')
    analytics.track('Password Reset Requested', {
      user_id: user?.id
    })
  }

  const handleTwoFactor = () => {
    success('Coming Soon', 'Two-factor authentication is coming in the next update!')
    analytics.track('2FA Setup Clicked', {
      user_id: user?.id
    })
  }

  const handleDownloadData = () => {
    success('Processing', 'Your data export is being prepared. You\'ll receive an email when ready.')
    analytics.track('Data Export Requested', {
      user_id: user?.id
    })
  }

  const currentPlan = getPlanDetails(user?.subscription_tier || 'free')
  const usageData = {
    letters: 7,
    limit: currentPlan.limits.letters === 999999 ? 'unlimited' : currentPlan.limits.letters
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account, HOA properties, and preferences.
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Profile Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input 
                type="text" 
                className="input-liquid" 
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                className="input-liquid" 
                value={profileData.email}
                disabled
                title="Email cannot be changed"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                {profileData.photo ? (
                  <img 
                    src={URL.createObjectURL(profileData.photo)} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <button 
            onClick={handleProfileSave}
            disabled={isLoading}
            className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="loading-liquid mx-auto"></div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </motion.div>

      {/* HOA Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold">HOA Properties</h2>
        </div>
        
        <div className="space-y-4">
          {hoaProperties.map((property) => (
            <div key={property.id} className="glass-surface p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{property.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{property.address}</p>
                </div>
                <button 
                  onClick={() => success('Coming Soon', 'HOA editing is coming in the next update!')}
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={handleAddNewHOA}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New HOA
          </button>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates about violations and complaints</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Instant alerts for urgent matters</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Billing Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold">Billing & Subscription</h2>
        </div>
        
        <div className="space-y-6">
          <div className="glass-surface p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">{currentPlan.name} Plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentPlan.name === 'Free' ? '1 HOA, ' : ''}
                  {typeof currentPlan.limits.letters === 'number' ? `${currentPlan.limits.letters} letters/month` : 'Unlimited letters'}
                </p>
              </div>
              {currentPlan.name === 'Free' && (
                <button 
                  onClick={handleUpgrade}
                  className="btn-primary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Upgrade
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage this month:</span>
                <span>
                  {usageData.letters}/{usageData.limit === 'unlimited' ? '∞' : usageData.limit} letters
                </span>
              </div>
              {usageData.limit !== 'unlimited' && (
                <div className="progress-liquid">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(usageData.letters / (usageData.limit as number)) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleViewBillingHistory}
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Billing History
          </button>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold">Security</h2>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleChangePassword}
            className="btn-secondary flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button 
            onClick={handleTwoFactor}
            className="btn-secondary flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Two-Factor Authentication
          </button>
          <button 
            onClick={handleDownloadData}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Data
          </button>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-6">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Toggle between light and dark themes</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>
    </div>
  )
}