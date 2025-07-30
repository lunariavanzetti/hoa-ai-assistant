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
  Building2
} from 'lucide-react'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Violations', href: '/violations', icon: AlertTriangle },
  { name: 'Complaints', href: '/complaints', icon: MessageCircle },
  { name: 'Complaint Reply', href: '/complaint-reply', icon: MessageCircle },
  { name: 'Meetings', href: '/meetings', icon: Mic },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Data Monitor', href: '/data-monitor', icon: Shield },
  { name: 'Onboarding', href: '/onboarding', icon: UserCheck },
  { name: 'Pricing', href: '/pricing', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export const Sidebar: React.FC = () => {
  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 h-screen glass-surface m-4 rounded-3xl flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient">Kateriss</h1>
            <p className="text-xs text-gray-500">HOA AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `nav-item flex items-center gap-3 ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade prompt for free users */}
      <div className="p-4">
        <div className="glass-card p-4 text-center">
          <h3 className="font-semibold text-sm mb-2">Upgrade to Pro</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Unlock unlimited AI letters and advanced features
          </p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="btn-primary w-full text-sm py-2"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}