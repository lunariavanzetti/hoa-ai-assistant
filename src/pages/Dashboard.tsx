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
  Crown,
  MoreHorizontal,
  Clock,
  Grid3X3,
  List
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const mockProjects = [
    {
      id: 1,
      title: "Product Launch Video",
      thumbnail: "/project1.jpg",
      lastEdited: "2 hours ago",
      duration: "45s",
      status: "completed"
    },
    {
      id: 2,
      title: "Brand Story",
      thumbnail: "/project2.jpg",
      lastEdited: "1 day ago",
      duration: "1m 20s",
      status: "completed"
    },
    {
      id: 3,
      title: "Social Media Clip",
      thumbnail: "/project3.jpg",
      lastEdited: "3 days ago",
      duration: "30s",
      status: "processing"
    },
    {
      id: 4,
      title: "Tutorial Video",
      thumbnail: "/project4.jpg",
      lastEdited: "1 week ago",
      duration: "2m 15s",
      status: "completed"
    },
    {
      id: 5,
      title: "Marketing Campaign",
      thumbnail: "/project5.jpg",
      lastEdited: "2 weeks ago",
      duration: "1m 5s",
      status: "completed"
    },
    {
      id: 6,
      title: "Demo Presentation",
      thumbnail: "/project6.jpg",
      lastEdited: "1 month ago",
      duration: "3m 10s",
      status: "completed"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
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
                  className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Projects
                </button>
                <button
                  onClick={handleViewTemplates}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Flow TV
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
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                <Crown className="w-4 h-4" />
                <span
                  className="text-sm font-medium"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  {isPro ? `${usageStats?.credits_remaining || 85}/100` : '5/5 free'}
                </span>
              </div>

              {/* Search */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Settings */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-normal text-gray-900"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Projects
            </h1>
            <p
              className="text-gray-600 mt-1"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Create and manage your AI video projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* New Project Button */}
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span
                className="font-medium"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                New project
              </span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }`}>
          {mockProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: project.id * 0.1 }}
              className={`group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
              }`}
              onClick={() => navigate('/generate')}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <Play className="w-8 h-8 text-gray-400" />
                    {project.status === 'processing' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2"
                        style={{ fontFamily: 'Google Sans, sans-serif' }}
                      >
                        {project.title}
                      </h3>
                      <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all">
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
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-4">
                    <Play className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span style={{ fontFamily: 'Google Sans, sans-serif' }}>
                        {project.lastEdited}
                      </span>
                      <span style={{ fontFamily: 'Google Sans, sans-serif' }}>
                        {project.duration}
                      </span>
                    </div>
                  </div>

                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {mockProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-12 h-12 text-gray-400" />
            </div>
            <h3
              className="text-xl font-medium text-gray-900 mb-2"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              No projects yet
            </h3>
            <p
              className="text-gray-600 mb-8 max-w-md mx-auto"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Create your first AI video project to get started with Flow
            </p>
            <button
              onClick={handleCreateProject}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Create your first project
            </button>
          </div>
        )}
      </main>
    </div>
  )
}