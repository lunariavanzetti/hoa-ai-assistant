import React from 'react'
import { Bell, Search, User, LogOut, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthStore } from '@/stores/auth'
import { motion } from 'framer-motion'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-surface m-2 sm:m-4 mb-0 rounded-xl sm:rounded-2xl p-3 sm:p-4"
    >
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors mr-3"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xs sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="input-liquid pl-10 py-2 text-sm w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg sm:rounded-xl glass-surface hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>

          {/* User menu */}
          <div className="flex items-center gap-2 sm:gap-3 glass-surface px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="text-xs sm:text-sm hidden sm:block">
              <div className="font-medium">{user?.full_name}</div>
              <div className="text-gray-500 capitalize">{user?.subscription_tier} plan</div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}