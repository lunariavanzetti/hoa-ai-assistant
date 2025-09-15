import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Video,
  Play,
  Download,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Filter,
  Search
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface VideoProject {
  id: string
  title: string
  thumbnailUrl?: string
  videoUrl?: string
  status: 'completed' | 'processing' | 'failed'
  quality: 'hd' | '4k'
  duration: number
  createdAt: string
  fileSize: number
  originalPrompt: string
  template: string
}

export const VideoHistory: React.FC = () => {
  const [videos, setVideos] = useState<VideoProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [qualityFilter, setQualityFilter] = useState<string>('all')

  // Mock data - replace with actual API call
  const mockVideos: VideoProject[] = [
    {
      id: 'video_1',
      title: 'Product Launch Announcement',
      thumbnailUrl: '/videos/thumbs/product-launch.jpg',
      videoUrl: '/videos/product-launch.mp4',
      status: 'completed',
      quality: '4k',
      duration: 45,
      createdAt: '2024-01-15T10:30:00Z',
      fileSize: 89456123,
      originalPrompt: 'Create a dynamic product launch video for our new smartphone...',
      template: 'Dynamic Intro'
    },
    {
      id: 'video_2',
      title: 'Tutorial: Getting Started',
      thumbnailUrl: '/videos/thumbs/tutorial.jpg',
      videoUrl: '/videos/tutorial.mp4',
      status: 'completed',
      quality: 'hd',
      duration: 120,
      createdAt: '2024-01-14T15:22:00Z',
      fileSize: 156789012,
      originalPrompt: 'Educational video explaining how to use our platform...',
      template: 'Tutorial Format'
    },
    {
      id: 'video_3',
      title: 'Social Media Promo',
      thumbnailUrl: '/videos/thumbs/social-promo.jpg',
      status: 'processing',
      quality: 'hd',
      duration: 30,
      createdAt: '2024-01-14T12:10:00Z',
      fileSize: 0,
      originalPrompt: 'Short promotional video for Instagram and TikTok...',
      template: 'Social Vertical'
    },
    {
      id: 'video_4',
      title: 'Company Overview',
      status: 'failed',
      quality: 'hd',
      duration: 60,
      createdAt: '2024-01-13T09:45:00Z',
      fileSize: 0,
      originalPrompt: 'Professional company overview video for our website...',
      template: 'Corporate Presentation'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVideos(mockVideos)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.originalPrompt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || video.status === statusFilter
    const matchesQuality = qualityFilter === 'all' || video.quality === qualityFilter
    return matchesSearch && matchesStatus && matchesQuality
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDownload = (video: VideoProject) => {
    if (video.videoUrl) {
      // Simulate download
      const link = document.createElement('a')
      link.href = video.videoUrl
      link.download = `${video.title}.mp4`
      link.click()
    }
  }

  const handleDelete = (videoId: string) => {
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      setVideos(videos.filter(v => v.id !== videoId))
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl glass-surface">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Videos</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and download your generated videos
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos by title or prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="px-3 py-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400"
            >
              <option value="all">All Quality</option>
              <option value="hd">HD (1080p)</option>
              <option value="4k">4K (2160p)</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{videos.filter(v => v.status === 'completed').length}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{videos.filter(v => v.status === 'processing').length}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(videos.reduce((acc, v) => acc + v.duration, 0) / 60)}m
            </div>
            <div className="text-sm text-gray-500">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {formatFileSize(videos.reduce((acc, v) => acc + v.fileSize, 0))}
            </div>
            <div className="text-sm text-gray-500">Storage Used</div>
          </div>
        </div>
      </motion.div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-0 overflow-hidden group"
          >
            {/* Video Thumbnail */}
            <div className="aspect-video bg-black relative overflow-hidden">
              {video.thumbnailUrl && video.status === 'completed' ? (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                />
              ) : video.status === 'processing' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                    <div className="text-lg font-semibold">Processing...</div>
                  </div>
                </div>
              ) : video.status === 'failed' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/50 to-pink-900/50">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">⚠️</div>
                    <div className="text-lg font-semibold">Generation Failed</div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <Video className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(video.status)}`}>
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </div>
              </div>

              {/* Quality Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {video.quality.toUpperCase()}
                </div>
              </div>

              {/* Play Button for Completed Videos */}
              {video.status === 'completed' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn-primary py-2 px-4 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </motion.button>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1 truncate">{video.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {video.originalPrompt}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(video.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Template and File Size */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Template: {video.template}</span>
                <span>{formatFileSize(video.fileSize)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {video.status === 'completed' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(video)}
                      className="btn-primary flex-1 py-2 px-3 flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </motion.button>
                    <button className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </>
                )}

                {video.status === 'failed' && (
                  <button className="btn-primary flex-1 py-2 px-3 text-sm">
                    Retry Generation
                  </button>
                )}

                <button
                  onClick={() => handleDelete(video.id)}
                  className="btn-secondary py-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Videos */}
      {filteredVideos.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass-card"
        >
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            {videos.length === 0 ? 'No Videos Yet' : 'No Videos Found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {videos.length === 0
              ? "You haven't generated any videos yet. Create your first AI video now!"
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {videos.length === 0 ? (
            <button
              onClick={() => window.location.href = '/generate'}
              className="btn-primary py-2 px-6"
            >
              Generate Your First Video
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setQualityFilter('all')
              }}
              className="btn-secondary py-2 px-6"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}