import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  Plus,
  Sparkles,
  Search,
  Settings,
  User,
  HelpCircle,
  Crown,
  MoreHorizontal,
  Clock
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'
import { usageTrackingService, type UsageStats } from '@/lib/usageTracking'
import { getCurrentUserPlan } from '@/lib/analytics'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
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

  const handleCreateProject = () => {
    navigate('/generate')
  }

  const handleViewTemplates = () => {
    navigate('/templates')
  }

  const handleViewProjects = () => {
    navigate('/videos')
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  const mockProjects = [
    {
      id: 1,
      title: "Product Launch Video",
      thumbnail: "/project1.jpg",
      lastEdited: "2 hours ago",
      duration: "45s"
    },
    {
      id: 2,
      title: "Brand Story",
      thumbnail: "/project2.jpg",
      lastEdited: "1 day ago",
      duration: "1m 20s"
    },
    {
      id: 3,
      title: "Social Media Clip",
      thumbnail: "/project3.jpg",
      lastEdited: "3 days ago",
      duration: "30s"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-50">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-300 bg-white/80 dark:bg-gray-50/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span
                  className="text-xl font-medium text-gray-900"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Kateriss
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  className="text-sm font-medium text-blue-600"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Projects
                </button>
                <button
                  onClick={handleViewTemplates}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Templates
                </button>
                <button
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Help
                </button>
              </nav>
            </div>

            {/* Right: Credits, Search & User Menu */}
            <div className="flex items-center gap-4">
              {/* Credits Counter */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-200 rounded-full">
                <Crown className="w-4 h-4 text-amber-600" />
                <span
                  className="text-sm font-medium text-gray-700"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  {isPro ? `${usageStats?.credits_remaining || 0} credits` : 'Free Plan'}
                </span>
              </div>

              {/* Search */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1
              className="text-3xl md:text-4xl font-normal text-gray-900 mb-4"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              What will you create today?
            </h1>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Start a new video project or continue working on your existing ones
            </p>
          </motion.div>

          {/* New Project CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span
                className="text-lg font-medium"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                New project
              </span>
            </button>
          </motion.div>

          {/* Quick Start Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 text-sm text-gray-600"
          >
            <button
              onClick={handleCreateProject}
              className="hover:text-blue-600 transition-colors"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Start from prompt
            </button>
            <span>•</span>
            <button
              onClick={handleViewTemplates}
              className="hover:text-blue-600 transition-colors"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Use template
            </button>
            <span>•</span>
            <button
              className="hover:text-blue-600 transition-colors"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Browse examples
            </button>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-medium text-gray-900"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Recent projects
            </h2>
            <button
              onClick={handleViewProjects}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              View all
            </button>
          </div>

          {mockProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 dark:bg-gray-200 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                        style={{ fontFamily: 'Google Sans, sans-serif' }}
                      >
                        {project.title}
                      </h3>
                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-200 rounded transition-all">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span style={{ fontFamily: 'Google Sans, sans-serif' }}>
                          {project.lastEdited}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'Google Sans, sans-serif' }}>
                        {project.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-100 rounded-xl">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3
                className="text-lg font-medium text-gray-900 mb-2"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                No projects yet
              </h3>
              <p
                className="text-gray-600 mb-6"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                Create your first AI video to get started
              </p>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                Create project
              </button>
            </div>
          )}
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-medium text-gray-900"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Templates
            </h2>
            <button
              onClick={handleViewTemplates}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Browse all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Product Demo', 'Social Media', 'Brand Story', 'Tutorial'].map((template, index) => (
              <button
                key={template}
                onClick={handleViewTemplates}
                className="group bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-300 rounded-xl p-6 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-200 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-300 transition-colors">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3
                  className="font-medium text-gray-900 mb-2"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  {template}
                </h3>
                <p
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Professional template ready to customize
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}