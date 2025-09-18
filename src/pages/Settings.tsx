import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  User,
  Bell,
  Shield,
  Key,
  Download,
  Smartphone,
  ArrowLeft,
  LogOut,
  Zap,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'
import { supabase } from '@/lib/supabase'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false
  })

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email || ''
      })
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [user])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Apply theme immediately
    const root = document.documentElement
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', newTheme)
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
      const { error: updateError } = await supabase
        .from('users')
        .update({ full_name: profileData.fullName })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      success('Profile Updated', 'Your profile changes have been saved successfully.')
    } catch (err) {
      console.error('Profile update error:', err)
      error('Update Failed', `Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
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
    } catch (err) {
      console.error('Password reset error:', err)
      error('Reset Failed', 'Failed to send password reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactor = () => {
    success('Coming Soon', 'Two-factor authentication is coming in the next update!')
  }

  const handleDownloadData = async () => {
    try {
      const userData = {
        profile: {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name,
          created_at: user?.created_at
        },
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
        window.location.href = '/'
      } catch (err) {
        console.error('Sign out error:', err)
        error('Sign Out Failed', 'Failed to sign out. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Liquid Background */}
      <div
        className="fixed inset-0 z-[-1] opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 122, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(175, 82, 222, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 45, 146, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(255, 149, 0, 0.15) 0%, transparent 50%),
            linear-gradient(145deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #000000 100%)
          `,
          animation: 'liquidFlow 20s ease-in-out infinite'
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <Video className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-medium text-white" style={{ fontFamily: 'Google Sans, sans-serif' }}>
                Kateriss
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Token Counter */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {user?.tokens || 0} tokens
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-white/70">Manage your account and preferences</p>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/70">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/50 focus:outline-none cursor-not-allowed"
                      value={profileData.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-white/60">Receive updates about your videos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Push Notifications</h3>
                    <p className="text-sm text-white/60">Instant alerts for video completion</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleChangePassword}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </button>
                <button
                  onClick={handleTwoFactor}
                  className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Two-Factor Authentication
                </button>
                <button
                  onClick={handleDownloadData}
                  className="bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 w-full justify-center py-3 px-4 rounded-xl transition-colors"
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
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Monitor className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Appearance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-3">Theme</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                        theme === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                        theme === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                        theme === 'system'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      System
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold mb-6 text-white">Account Actions</h2>

              <div className="space-y-4">
                <button
                  onClick={handleSignOut}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                <p className="text-xs text-white/50 text-center">
                  You will be redirected to the login page
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% {
            filter: hue-rotate(0deg) blur(0px);
          }
          33% {
            filter: hue-rotate(120deg) blur(2px);
          }
          66% {
            filter: hue-rotate(240deg) blur(1px);
          }
        }
      `}</style>
    </div>
  )
}