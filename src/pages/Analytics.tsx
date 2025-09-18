import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Zap,
  ArrowLeft,
  LogOut,
  BarChart3,
  TrendingUp,
  Eye,
  Download,
  Calendar,
  Clock,
  Menu,
  History,
  User
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export const Analytics: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Mock analytics data
  const stats = [
    { label: 'Videos Generated', value: '24', icon: Video, trend: '+12%' },
    { label: 'Total Views', value: '1.2K', icon: Eye, trend: '+18%' },
    { label: 'Downloads', value: '186', icon: Download, trend: '+5%' },
    { label: 'Tokens Used', value: '24', icon: Zap, trend: '' }
  ]

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
              {/* Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

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

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-20 left-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-50">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigate('/templates')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => {
                  navigate('/videos')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  navigate('/analytics')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
              <p className="text-white/70">Track your AI video generation performance</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-6 h-6 text-white/70" />
                    {stat.trend && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.trend.startsWith('+')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Video Generation Trends</h3>
                </div>
                <div className="h-48 flex items-center justify-center border border-white/10 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">Chart coming soon</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">Usage by Day</h3>
                </div>
                <div className="h-48 flex items-center justify-center border border-white/10 rounded-lg">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-white/30 mx-auto mb-2" />
                    <p className="text-white/50 text-sm">Chart coming soon</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Generated video', description: 'A sunset over mountains', time: '2 hours ago' },
                  { action: 'Downloaded video', description: 'Urban cityscape at night', time: '5 hours ago' },
                  { action: 'Generated video', description: 'Ocean waves crashing', time: '1 day ago' },
                  { action: 'Generated video', description: 'Forest in autumn', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                    <div>
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-white/60 text-xs">{activity.description}</p>
                    </div>
                    <span className="text-white/50 text-xs">{activity.time}</span>
                  </div>
                ))}
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