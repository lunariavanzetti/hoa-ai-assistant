import React from 'react'
import { motion } from 'framer-motion'
import { User, Building2, Bell, CreditCard, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const Settings: React.FC = () => {
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
              <input type="text" className="input-liquid" defaultValue="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" className="input-liquid" defaultValue="john@example.com" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <button className="btn-secondary">Change Photo</button>
            </div>
          </div>
          
          <button className="btn-primary">Save Changes</button>
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
          <div className="glass-surface p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sunset Ridge Community</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">123 Community Dr, City, ST 12345</p>
              </div>
              <button className="btn-secondary text-sm">Edit</button>
            </div>
          </div>
          
          <button className="btn-primary">Add New HOA</button>
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
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Instant alerts for urgent matters</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
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
                <h3 className="font-semibold">Free Plan</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">1 HOA, 10 letters/month</p>
              </div>
              <button className="btn-primary">Upgrade</button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage this month:</span>
                <span>7/10 letters</span>
              </div>
              <div className="progress-liquid">
                <div className="progress-fill" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
          
          <button className="btn-secondary">View Billing History</button>
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
          <button className="btn-secondary">Change Password</button>
          <button className="btn-secondary">Two-Factor Authentication</button>
          <button className="btn-secondary">Download Data</button>
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