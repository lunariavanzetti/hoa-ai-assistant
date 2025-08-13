import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Bell, CreditCard, Shield, Plus, ExternalLink, Download, Key, Smartphone, Edit3, Trash2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'
import { paddleClient } from '@/lib/paddleClient'
import { analytics, getPlanDetails, getCurrentUserPlan } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'
import { ManualUpgrade } from '@/components/ui/ManualUpgrade'
import { UsageDisplay } from '@/components/ui/UsageDisplay'

export const Settings: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false
  })
  const [hoaProperties, setHoaProperties] = useState<Array<{id: string, name: string, address: string}>>([])
  const [isEditingHOA, setIsEditingHOA] = useState<string | null>(null)
  const [hoaForm, setHoaForm] = useState({ name: '', address: '' })

  // Load user data and HOAs on component mount
  useEffect(() => {
    if (user) {
      console.log('User data loaded:', user)
      setProfileData({
        fullName: user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email || ''
      })
      
      // Load HOA properties from database
      loadHOAProperties()
    }
  }, [user])

  const loadHOAProperties = async () => {
    if (!user) {
      console.log('No user, skipping HOA load')
      return
    }
    
    console.log('Loading HOA properties for user:', user.id)
    
    try {
      // Try database first with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database load timeout after 3 seconds'))
        }, 3000)
      })
      
      const dbPromise = supabase
        .from('hoa_properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      
      const { data, error } = await Promise.race([dbPromise, timeoutPromise])
      
      if (error) {
        console.error('Error loading HOA properties:', error)
        throw error
      }
      
      console.log('HOA properties loaded from database:', data)
      
      // Merge with localStorage data
      const localHOAs = JSON.parse(localStorage.getItem(`hoa_properties_${user.id}`) || '[]')
      const allHOAs = [...(data || []), ...localHOAs]
      
      setHoaProperties(allHOAs)
    } catch (err) {
      console.error('Database load failed, using localStorage fallback:', err)
      
      // Load from localStorage as fallback
      const localHOAs = JSON.parse(localStorage.getItem(`hoa_properties_${user.id}`) || '[]')
      
      if (localHOAs.length > 0) {
        console.log('Loading HOAs from localStorage:', localHOAs)
        setHoaProperties(localHOAs)
      } else {
        console.log('No local HOAs found, setting default')
        // Set default HOA if none exist
        const defaultHOAs = [{
          id: 'default_1',
          name: 'Sunset Ridge Community',
          address: '123 Community Dr, City, ST 12345'
        }]
        setHoaProperties(defaultHOAs)
        localStorage.setItem(`hoa_properties_${user.id}`, JSON.stringify(defaultHOAs))
      }
    }
  }

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
      
      // Update the users table with the new profile data
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: profileData.fullName })
        .eq('id', user.id)
      
      if (updateError) {
        throw updateError
      }
      
      
      success('Profile Updated', 'Your profile changes have been saved successfully.')
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


  const handleAddNewHOA = () => {
    setIsEditingHOA('new')
    setHoaForm({ name: '', address: '' })
  }

  const handleEditHOA = (hoaId: string) => {
    const hoa = hoaProperties.find(h => h.id === hoaId)
    if (!hoa) return

    setIsEditingHOA(hoaId)
    setHoaForm({ name: hoa.name, address: hoa.address })
  }

  const handleSaveHOA = async () => {
    console.log('handleSaveHOA triggered with:', { hoaForm, isEditingHOA, user: user?.id })
    
    if (!hoaForm.name.trim() || !hoaForm.address.trim()) {
      console.log('Validation failed: missing name or address')
      error('Invalid Data', 'Please enter both HOA name and address.')
      return
    }

    if (!user) {
      console.log('No user found')
      error('No User', 'Please log in to manage HOA properties.')
      return
    }

    setIsLoading(true)
    try {
      console.log('Attempting to save HOA...')
      
      // Add timeout for database operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database operation timeout after 5 seconds'))
        }, 5000)
      })
      
      if (isEditingHOA === 'new') {
        console.log('Adding new HOA to database')
        
        try {
          const insertPromise = supabase
            .from('hoa_properties')
            .insert({
              user_id: user.id,
              name: hoaForm.name,
              address: hoaForm.address
            })
            .select()

          const { data, error: insertError } = await Promise.race([insertPromise, timeoutPromise])

          if (insertError) {
            console.error('Database insert error:', insertError)
            throw insertError
          }

          console.log('HOA inserted successfully:', data)
          if (data && data[0]) {
            setHoaProperties(prev => [...prev, data[0]])
          }
        } catch (dbError) {
          console.error('Database operation failed, using local storage fallback:', dbError)
          
          // Fallback to local storage
          const newHOA = {
            id: `local_${Date.now()}`,
            name: hoaForm.name,
            address: hoaForm.address,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
          
          setHoaProperties(prev => [...prev, newHOA])
          
          // Store in localStorage as backup
          const existingHOAs = JSON.parse(localStorage.getItem(`hoa_properties_${user.id}`) || '[]')
          existingHOAs.push(newHOA)
          localStorage.setItem(`hoa_properties_${user.id}`, JSON.stringify(existingHOAs))
          
          console.log('HOA saved to local storage:', newHOA)
        }
        
        success('HOA Added', `${hoaForm.name} has been added to your properties!`)
        analytics.track('Add HOA Clicked', {
          user_id: user.id,
          hoa_name: hoaForm.name,
          current_hoa_count: hoaProperties.length + 1
        })
      } else {
        console.log('Updating existing HOA:', isEditingHOA)
        
        try {
          const updatePromise = supabase
            .from('hoa_properties')
            .update({
              name: hoaForm.name,
              address: hoaForm.address
            })
            .eq('id', isEditingHOA)
            .eq('user_id', user.id)

          const { error: updateError } = await Promise.race([updatePromise, timeoutPromise])

          if (updateError) {
            console.error('Database update error:', updateError)
            throw updateError
          }
        } catch (dbError) {
          console.error('Database update failed, using local update:', dbError)
          
          // Update localStorage as fallback
          const existingHOAs = JSON.parse(localStorage.getItem(`hoa_properties_${user.id}`) || '[]')
          const updatedHOAs = existingHOAs.map((hoa: any) => 
            hoa.id === isEditingHOA 
              ? { ...hoa, name: hoaForm.name, address: hoaForm.address, updated_at: new Date().toISOString() }
              : hoa
          )
          localStorage.setItem(`hoa_properties_${user.id}`, JSON.stringify(updatedHOAs))
        }

        setHoaProperties(prev => prev.map(hoa => 
          hoa.id === isEditingHOA 
            ? { ...hoa, name: hoaForm.name, address: hoaForm.address }
            : hoa
        ))
        success('HOA Updated', `${hoaForm.name} has been updated!`)
        analytics.track('HOA Edited', {
          user_id: user.id,
          hoa_id: isEditingHOA,
          hoa_name: hoaForm.name
        })
      }
      
      console.log('HOA operation completed successfully')
      setIsEditingHOA(null)
      setHoaForm({ name: '', address: '' })
    } catch (err) {
      console.error('HOA save error:', err)
      error('Save Failed', `Failed to save HOA: ${err instanceof Error ? err.message : 'Unknown error'}. Using local storage fallback.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteHOA = async (hoaId: string) => {
    const hoa = hoaProperties.find(h => h.id === hoaId)
    if (!hoa || !user) return

    if (confirm(`Are you sure you want to delete ${hoa.name}?`)) {
      setIsLoading(true)
      try {
        const { error: deleteError } = await supabase
          .from('hoa_properties')
          .delete()
          .eq('id', hoaId)
          .eq('user_id', user.id)

        if (deleteError) throw deleteError

        setHoaProperties(prev => prev.filter(h => h.id !== hoaId))
        success('HOA Deleted', `${hoa.name} has been removed from your properties.`)
        analytics.track('HOA Deleted', {
          user_id: user.id,
          hoa_id: hoaId,
          hoa_name: hoa.name
        })
      } catch (err) {
        console.error('HOA delete error:', err)
        error('Delete Failed', `Failed to delete HOA: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }
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

  const handleChangePassword = async () => {
    if (!user?.email) {
      error('No Email', 'No email found for password reset.')
      return
    }

    setIsLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      success('Email Sent', 'Password reset instructions have been sent to your email.')
      analytics.track('Password Reset Requested', {
        user_id: user.id
      })
    } catch (err) {
      console.error('Password reset error:', err)
      error('Reset Failed', 'Failed to send password reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactor = () => {
    success('Coming Soon', 'Two-factor authentication is coming in the next update!')
    analytics.track('2FA Setup Clicked', {
      user_id: user?.id
    })
  }

  const handleDownloadData = async () => {
    try {
      // Create a simple data export
      const userData = {
        profile: {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name,
          created_at: user?.created_at
        },
        hoa_properties: hoaProperties,
        notification_settings: notificationSettings
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `kateriss_data_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      success('Download Complete', 'Your data has been downloaded to your device.')
      analytics.track('Data Export Requested', {
        user_id: user?.id
      })
    } catch (err) {
      console.error('Data export error:', err)
      error('Export Failed', 'Failed to export data. Please try again.')
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      setIsLoading(true)
      try {
        await signOut()
        success('Signed Out', 'You have been successfully signed out.')
        // Force redirect to home page
        window.location.href = '/'
      } catch (err) {
        console.error('Sign out error:', err)
        error('Sign Out Failed', 'Failed to sign out. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const userPlanTier = getCurrentUserPlan(user)
  const currentPlan = getPlanDetails(userPlanTier)
  const usageData = {
    letters: 7,
    limit: currentPlan.limits.letters === 999999 ? 'unlimited' : currentPlan.limits.letters
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-8"
      >
        <h1 className="heading-2 mb-2">SETTINGS</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account, HOA properties, and preferences.
        </p>
        <ManualUpgrade />
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="brutal-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-brutal-electric" />
          <h2 className="text-xl font-bold">PROFILE SETTINGS</h2>
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
        className="brutal-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold">HOA Properties</h2>
        </div>
        
        <div className="space-y-4">
          {hoaProperties.map((property) => (
            <div key={property.id} className="brutal-surface p-4">
              {isEditingHOA === property.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="HOA Name"
                    value={hoaForm.name}
                    onChange={(e) => setHoaForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-liquid w-full"
                  />
                  <input
                    type="text"
                    placeholder="HOA Address"
                    value={hoaForm.address}
                    onChange={(e) => setHoaForm(prev => ({ ...prev, address: e.target.value }))}
                    className="input-liquid w-full"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveHOA} 
                      disabled={isLoading}
                      className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={() => setIsEditingHOA(null)} 
                      disabled={isLoading}
                      className={`btn-secondary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{property.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{property.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditHOA(property.id)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteHOA(property.id)}
                      className="btn-secondary text-sm flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isEditingHOA === 'new' ? (
            <div className="brutal-surface p-4">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="HOA Name"
                  value={hoaForm.name}
                  onChange={(e) => setHoaForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-liquid w-full"
                />
                <input
                  type="text"
                  placeholder="HOA Address"
                  value={hoaForm.address}
                  onChange={(e) => setHoaForm(prev => ({ ...prev, address: e.target.value }))}
                  className="input-liquid w-full"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveHOA} 
                    disabled={isLoading}
                    className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Adding...' : 'Add HOA'}
                  </button>
                  <button 
                    onClick={() => setIsEditingHOA(null)} 
                    disabled={isLoading}
                    className={`btn-secondary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleAddNewHOA}
              className="btn-primary flex items-center justify-center gap-2 w-full"
            >
              <Plus className="w-4 h-4" />
              ADD NEW HOA
            </button>
          )}
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card p-6"
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
        className="brutal-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold">Billing & Subscription</h2>
        </div>
        
        <div className="space-y-6">
          <div className="brutal-surface p-4">
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
              <UsageDisplay feature="violation_letters" />
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
        className="brutal-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-brutal-electric" />
          <h2 className="text-xl font-bold">SECURITY</h2>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleChangePassword}
            className="btn-primary flex items-center gap-2 mb-4 w-full justify-center"
          >
            <Key className="w-4 h-4" />
            CHANGE PASSWORD
          </button>
          <button 
            onClick={handleTwoFactor}
            className="btn-secondary flex items-center gap-2 mb-4 w-full justify-center"
          >
            <Smartphone className="w-4 h-4" />
            TWO-FACTOR AUTHENTICATION
          </button>
          <button 
            onClick={handleDownloadData}
            className="btn-secondary flex items-center gap-2 w-full justify-center"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD DATA
          </button>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="brutal-card p-6"
      >
        <h2 className="text-xl font-bold mb-6">APPEARANCE</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Toggle between light and dark themes</p>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="brutal-card p-6"
      >
        <h2 className="text-xl font-bold mb-6">ACCOUNT ACTIONS</h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleSignOut}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <ExternalLink className="w-4 h-4" />
            SIGN OUT
          </button>
          <p className="text-xs text-gray-500 text-center">
            You will be redirected to the login page
          </p>
        </div>
      </motion.div>
    </div>
  )
}