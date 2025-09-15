import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'
import { usageTrackingService, type UsageStats } from '@/lib/usageTracking'
import { getCurrentUserPlan } from '@/lib/analytics'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  const userPlan = getCurrentUserPlan(user)
  const isPro = userPlan !== 'free'

  // Load user usage data
  useEffect(() => {
    const loadUsageData = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        const stats = await usageTrackingService.getUserStats(user.id)
        setUsageStats(stats)
      } catch (error) {
        console.error('Failed to load usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsageData()
  }, [user?.id])

  // Initialize Paddle.js
  useEffect(() => {
    const initializePaddleWithUser = async () => {
      try {
        const paddle = await paddleClient.initialize()

        if (user?.email) {
          await paddle.Setup({
            pwCustomer: user.email,
            customer: {
              email: user.email,
              id: user.id
            }
          })
        }
      } catch (error) {
        console.error('❌ Failed to initialize Paddle:', error)
      }
    }

    if (user) {
      initializePaddleWithUser()
    }
  }, [user])

  const handleCreateVideo = () => {
    navigate('/generate')
  }

  const handleViewVideos = () => {
    navigate('/videos')
  }

  const handleViewTemplates = () => {
    navigate('/templates')
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"></div>
        {/* Subtle animated particles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Welcome Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                What will you
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  create today?
                </span>
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Turn your imagination into reality with AI-powered video creation
              </p>
            </div>

            {/* Main Action */}
            <motion.div
              className="mb-16"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleCreateVideo}
                className="group relative overflow-hidden bg-white text-black px-12 py-6 rounded-3xl text-xl font-semibold transition-all duration-300 hover:bg-white/90 flex items-center gap-4 mx-auto"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span>Create new video</span>
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Templates */}
              <motion.button
                onClick={handleViewTemplates}
                className="group p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Templates</h3>
                <p className="text-white/60 text-sm">Start with ready-made templates</p>
                <ArrowRight className="w-5 h-5 text-white/40 mt-4 group-hover:text-white/80 transition-colors" />
              </motion.button>

              {/* My Videos */}
              <motion.button
                onClick={handleViewVideos}
                className="group p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">My Videos</h3>
                <p className="text-white/60 text-sm">View your created videos</p>
                <ArrowRight className="w-5 h-5 text-white/40 mt-4 group-hover:text-white/80 transition-colors" />
              </motion.button>

              {/* Upgrade */}
              <motion.button
                onClick={handleUpgrade}
                className="group p-8 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 text-left"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Upgrade</h3>
                <p className="text-white/60 text-sm">Unlock unlimited videos</p>
                <ArrowRight className="w-5 h-5 text-white/40 mt-4 group-hover:text-white/80 transition-colors" />
              </motion.button>
            </div>

            {/* Simple Stats */}
            {!loading && usageStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {isPro ? usageStats.videos_this_month || 0 : '•••'}
                    </div>
                    <p className="text-white/60 text-sm">Videos this month</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {isPro ? `${Math.round((usageStats.total_watch_time || 0) / 60)}m` : '•••'}
                    </div>
                    <p className="text-white/60 text-sm">Watch time</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {isPro ? usageStats.video_downloads || 0 : '•••'}
                    </div>
                    <p className="text-white/60 text-sm">Downloads</p>
                  </div>
                </div>

                {!isPro && (
                  <div className="mt-6 text-center">
                    <p className="text-white/60 text-sm mb-4">
                      Upgrade to track your video creation journey
                    </p>
                    <button
                      onClick={handleUpgrade}
                      className="px-6 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-colors"
                    >
                      Unlock Analytics
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Recent Activity Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-white/40 text-sm">
                Your videos will appear here once you start creating
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}