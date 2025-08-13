import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertTriangle, 
  MessageCircle, 
  Mic, 
  FileText, 
  Shield,
  UserCheck,
  DollarSign,
  Settings,
  Building2,
  History as HistoryIcon,
  BarChart3,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { getCurrentUserPlan, getPlanDetails } from '@/lib/analytics'

interface SidebarProps {
  onClose?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  proOnly?: boolean
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Violations', href: '/violations', icon: AlertTriangle },
  { name: 'Complaint Reply', href: '/complaint-reply', icon: MessageCircle },
  { name: 'Meetings', href: '/meetings', icon: Mic },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'History', href: '/history', icon: HistoryIcon, proOnly: true },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, proOnly: true },
  { name: 'Data Monitor', href: '/data-monitor', icon: Shield },
  { name: 'Onboarding', href: '/onboarding', icon: UserCheck },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useAuthStore()
  const userPlanTier = getCurrentUserPlan(user)
  const currentPlan = getPlanDetails(userPlanTier)
  
  const handleNavClick = () => {
    // Close mobile sidebar when navigating
    onClose?.()
  }

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen glass-surface m-2 lg:m-4 rounded-2xl lg:rounded-3xl flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gradient">Kateriss</h1>
              <p className="text-xs text-gray-500">HOA AI Assistant</p>
            </div>
          </div>
          {/* Mobile close button */}
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isPro = userPlanTier !== 'free'
            const isProOnlyItem = item.proOnly && !isPro
            
            return (
              <li key={item.name}>
                {isProOnlyItem ? (
                  <div className="nav-item flex items-center justify-between gap-3 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm sm:text-base">{item.name}</span>
                    </div>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-md">
                      Pro
                    </span>
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `nav-item flex items-center gap-3 ${isActive ? 'active' : ''}`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">{item.name}</span>
                  </NavLink>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Plan status */}
      <div className="p-4">
        <div className="glass-card p-4 text-center">
          <h3 className="font-semibold text-sm mb-2">{currentPlan.name} Plan</h3>
          {userPlanTier === 'free' ? (
            <>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Unlock unlimited AI letters and advanced features
              </p>
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="btn-primary w-full text-sm py-2"
              >
                Upgrade Now
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Active subscription • Premium features unlocked
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}