import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  Download,
  TrendingUp,
  Users,
  Sparkles,
  Lock
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'
import { usageTrackingService, type UsageStats, type UserActivity } from '@/lib/usageTracking'
import { getCurrentUserPlan } from '@/lib/analytics'

// Dynamic stats will be generated from real usage data

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  
  const userPlan = getCurrentUserPlan(user)
  const isPro = userPlan !== 'free'

  // Load user usage data
  useEffect(() => {
    const loadUsageData = async () => {
      if (!user?.id) return
      
      setLoading(true)
      try {
        // Load usage statistics
        const stats = await usageTrackingService.getUserStats(user.id)
        setUsageStats(stats)
        
        // Load recent activity (only for Pro+ users)
        if (isPro) {
          const activities = await usageTrackingService.getRecentActivities(user.id, 5)
          setRecentActivity(activities)
        }
      } catch (error) {
        console.error('Failed to load usage data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUsageData()
  }, [user?.id, isPro])

  // Initialize Paddle.js with customer data for in-app Retain notifications
  useEffect(() => {
    const initializePaddleWithUser = async () => {
      try {
        const paddle = await paddleClient.initialize()
        
        if (user?.email) {
          // Pass customer details to Paddle Retain for in-app notifications
          console.log('🔄 Initializing Paddle Retain with user:', user.email)
          
          // Initialize with customer data for Retain
          await paddle.Setup({
            pwCustomer: user.email, // Customer identifier for Retain
            customer: {
              email: user.email,
              id: user.id
            }
          })
          
          console.log('✅ Paddle Retain initialized with customer data')
        }
      } catch (error) {
        console.error('❌ Failed to initialize Paddle with user data:', error)
      }
    }
    
    if (user) {
      initializePaddleWithUser()
    }
  }, [user])

  const handleViewAll = () => {
    navigate('/history')
  }

  const handleCreateVideo = () => {
    navigate('/generate')
  }

  const handleViewTemplates = () => {
    navigate('/templates')
  }

  const handleVideoHistory = () => {
    navigate('/videos')
  }

  const handleAnalytics = () => {
    navigate('/analytics')
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  // Generate dynamic stats from real usage data
  const getStatsData = () => {
    if (!usageStats) return []
    
    return [
      {
        name: 'Videos Generated',
        value: usageStats.videos_this_month?.toString() || '0',
        change: isPro ? `${usageStats.videos_this_month || 0} this month` : 'Upgrade to track usage',
        changeType: isPro ? 'neutral' : 'upgrade',
        icon: Video,
        color: 'text-purple-400'
      },
      {
        name: 'Total Watch Time',
        value: `${Math.round((usageStats.total_watch_time || 0) / 60)}m`,
        change: isPro ? 'Total across all videos' : 'Premium feature',
        changeType: isPro ? 'neutral' : 'upgrade',
        icon: Play,
        color: 'text-blue-400'
      },
      {
        name: 'Video Downloads',
        value: usageStats.video_downloads?.toString() || '0',
        change: isPro ? `${usageStats.video_downloads || 0} total downloads` : 'Premium feature',
        changeType: isPro ? 'neutral' : 'upgrade',
        icon: Download,
        color: 'text-green-400'
      },
      {
        name: 'AI Enhancements',
        value: usageStats.ai_enhancements?.toString() || '0',
        change: isPro ? 'Prompts enhanced with AI' : 'Premium feature',
        changeType: isPro ? 'neutral' : 'upgrade',
        icon: Sparkles,
        color: 'text-yellow-400'
      }
    ]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6 lg:p-8"
      >
        <h1 className="heading-2 text-xl sm:text-2xl lg:text-3xl mb-2">Welcome back! 🎬</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Welcome to your AI-powered video creation dashboard. Transform your ideas into stunning videos in minutes.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card p-4 sm:p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 rounded w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))
        ) : (
          getStatsData().map((stat, index) => {
            const StatIcon = stat.icon
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card magnetic-hover p-4 sm:p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <StatIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                  {stat.changeType === 'upgrade' ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <TrendingUp className={`w-4 h-4 ${
                      stat.changeType === 'increase' ? 'text-green-400' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gradient mb-1">
                    {isPro ? stat.value : '•••'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">{stat.name}</p>
                  <p className={`text-xs ${
                    stat.changeType === 'upgrade' 
                      ? 'text-amber-600 cursor-pointer hover:text-amber-500' 
                      : 'text-gray-400'
                  }`}
                  onClick={stat.changeType === 'upgrade' ? handleUpgrade : undefined}>
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">Recent Activity</h2>
            {isPro && <button onClick={handleViewAll} className="btn-secondary text-sm">View All</button>}
          </div>
          
          <div className="space-y-4">
            {!isPro ? (
              // Free tier - show Pro upgrade prompt
              <div className="text-center py-8 glass-surface rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/20">
                <Lock className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Activity History - Pro Feature</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">
                  Track and view your generated content history with Pro+
                </p>
                <button 
                  onClick={handleUpgrade}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Upgrade to Pro
                </button>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const activityIcon = activity.activity_type === 'video_generated' ? Video :
                                   activity.activity_type === 'video_downloaded' ? Download :
                                   activity.activity_type === 'prompt_enhanced' ? Sparkles : Play

                const activityColor = activity.activity_type === 'video_generated' ? 'text-purple-400' :
                                    activity.activity_type === 'video_downloaded' ? 'text-green-400' :
                                    activity.activity_type === 'prompt_enhanced' ? 'text-yellow-400' : 'text-blue-400'
                
                return (
                  <div key={activity.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl glass-surface">
                    <div className={`p-2 rounded-xl glass-surface ${activityColor}`}>
                      {React.createElement(activityIcon, { className: "w-4 h-4" })}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium">{activity.title}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No videos created yet</p>
                <p className="text-xs mt-1">Start by generating your first AI video</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            <button onClick={handleCreateVideo} className="w-full btn-primary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Video className="w-4 h-4 flex-shrink-0" />
              Generate AI Video
            </button>

            <button onClick={handleViewTemplates} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              Browse Templates
            </button>

            <button onClick={handleVideoHistory} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Play className="w-4 h-4 flex-shrink-0" />
              My Videos
            </button>

            <button onClick={handleAnalytics} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              View Analytics
            </button>
          </div>

          {/* Usage Progress */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 glass-surface rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Monthly Usage
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Videos This Month</span>
                  <span>{usageStats?.videos_this_month || 0}/∞</span>
                </div>
                <div className="progress-liquid">
                  <div className="progress-fill" style={{ width: `${Math.min((usageStats?.videos_this_month || 0) * 10, 100)}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Video Credits</span>
                  <span>{usageStats?.credits_remaining || 0}</span>
                </div>
                <div className="progress-liquid">
                  <div className="progress-fill" style={{ width: `${Math.min((usageStats?.credits_remaining || 0) * 5, 100)}%` }}></div>
                </div>
              </div>
            </div>
            
            <button onClick={handleUpgrade} className="w-full btn-primary mt-4 text-sm">
              Upgrade Plan
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4">AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">🎯 Popular Style</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Professional style videos are trending 40% higher. Try this style for business content.
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">⚡ Generation Tip</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Your videos generate 60% faster with detailed prompts. Be specific for best results.
            </p>
          </div>

          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">💡 Recommendation</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Try the new 4K quality option for premium, professional-grade video content.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}