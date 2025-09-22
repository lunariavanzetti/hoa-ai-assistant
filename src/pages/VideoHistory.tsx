import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Play,
  Download,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Filter,
  Search,
  ArrowLeft,
  LogOut,
  Zap,
  Menu,
  History,
  BarChart3,
  User
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore, type GeneratedVideo } from '@/stores/videos'

// Use the GeneratedVideo type from the store
type VideoProject = GeneratedVideo & {
  thumbnailUrl?: string
  videoUrl?: string
  createdAt: string
  originalPrompt: string
}

export const VideoHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { generatedVideos, removeVideo } = useVideoStore()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [qualityFilter, setQualityFilter] = useState<string>('all')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Convert store videos to VideoProject format
  const videos: VideoProject[] = generatedVideos.map(video => ({
    ...video,
    videoUrl: video.url,
    createdAt: video.timestamp,
    originalPrompt: video.prompt
  }))

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    // Simulate brief loading to show the loading state
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
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
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleDownload = (video: VideoProject) => {
    if (video.videoUrl) {
      const link = document.createElement('a')
      link.href = video.videoUrl
      link.download = `${video.title}.mp4`
      link.click()
    }
  }

  const handleDelete = (videoId: string) => {
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      console.log('🗑️ Deleting video from store:', videoId)
      removeVideo(videoId)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
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

        <div className="relative z-10 px-2 sm:px-4 py-4 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="video-card p-4 sm:p-6 animate-pulse">
              <div className="h-6 sm:h-8 bg-white/10 rounded w-1/3 mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-white/10 rounded w-2/3"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="video-card p-3 sm:p-4 animate-pulse">
                  <div className="aspect-video bg-white/10 rounded-xl mb-3 sm:mb-4"></div>
                  <div className="h-5 sm:h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-white/10 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed Looped Liquid Background */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 122, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(175, 82, 222, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 45, 146, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(255, 149, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 90% 70%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 10% 90%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            linear-gradient(145deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #000000 100%)
          `,
          animation: 'liquidFlow 25s ease-in-out infinite',
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%'
        }}
      />

      {/* Additional animated overlay for more dynamic effect */}
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 60%),
            radial-gradient(circle at 70% 60%, rgba(244, 63, 94, 0.1) 0%, transparent 60%),
            radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)
          `,
          animation: 'liquidFlow 30s ease-in-out infinite reverse',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="relative z-10 scrollable-content">
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
              <span className="text-lg sm:text-xl font-medium text-white" style={{ fontFamily: 'Google Sans, sans-serif' }}>
                Kateriss
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {user?.usage_stats?.credits_remaining || user?.video_credits || 0} credits
                </span>
              </div>

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
          <div className="absolute top-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-64 video-card p-4 z-50">
            <div className="flex flex-col gap-3">
              {/* Mobile Credits Display */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Credits</span>
                </div>
                <span className="text-sm text-white/80">
                  {user?.usage_stats?.credits_remaining || user?.video_credits || 0}
                </span>
              </div>
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
        <main className="px-2 sm:px-4 py-4 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Videos</h1>
              <p className="text-white/70 text-sm sm:text-base">Manage and download your generated videos</p>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="video-card p-3 sm:p-6"
            >
              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-white/50" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="all" className="bg-gray-900">All Status</option>
                      <option value="completed" className="bg-gray-900">Completed</option>
                      <option value="processing" className="bg-gray-900">Processing</option>
                      <option value="failed" className="bg-gray-900">Failed</option>
                    </select>
                  </div>

                  <select
                    value={qualityFilter}
                    onChange={(e) => setQualityFilter(e.target.value)}
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="all" className="bg-gray-900">All Quality</option>
                    <option value="hd" className="bg-gray-900">HD (1080p)</option>
                    <option value="4k" className="bg-gray-900">4K (2160p)</option>
                  </select>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{videos.filter(v => v.status === 'completed').length}</div>
                  <div className="text-sm text-white/50">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{videos.filter(v => v.status === 'processing').length}</div>
                  <div className="text-sm text-white/50">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(videos.reduce((acc, v) => acc + v.duration, 0) / 60)}m
                  </div>
                  <div className="text-sm text-white/50">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatFileSize(videos.reduce((acc, v) => acc + v.fileSize, 0))}
                  </div>
                  <div className="text-sm text-white/50">Storage Used</div>
                </div>
              </div>
            </motion.div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="video-card rounded-xl overflow-hidden group"
                >
                  {/* Video Preview */}
                  <div className="aspect-video bg-black relative overflow-hidden">
                    {video.videoUrl && video.status === 'completed' ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        onMouseEnter={(e) => {
                          const video = e.target as HTMLVideoElement
                          video.currentTime = 2 // Show a frame from 2 seconds in
                        }}
                      />
                    ) : video.status === 'processing' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                        <div className="text-center text-white">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 animate-spin rounded-full border-2 sm:border-4 border-white border-t-transparent"></div>
                          <div className="text-sm sm:text-lg font-semibold">Processing...</div>
                        </div>
                      </div>
                    ) : video.status === 'failed' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/50 to-pink-900/50">
                        <div className="text-center text-white">
                          <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">⚠️</div>
                          <div className="text-sm sm:text-lg font-semibold">Generation Failed</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Video className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(video.status)}`}>
                        {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </div>
                    </div>

                    {/* Quality Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.quality.toUpperCase()}
                      </div>
                    </div>

                    {/* Play Button */}
                    {video.status === 'completed' && video.videoUrl && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            console.log('🎬 Playing video:', video.id, video.title)
                            const videoElement = document.createElement('video')
                            videoElement.src = video.videoUrl!
                            videoElement.controls = true
                            videoElement.autoplay = true
                            videoElement.style.position = 'fixed'
                            videoElement.style.top = '50%'
                            videoElement.style.left = '50%'
                            videoElement.style.transform = 'translate(-50%, -50%)'
                            videoElement.style.maxWidth = '90vw'
                            videoElement.style.maxHeight = '90vh'
                            videoElement.style.zIndex = '1000'
                            videoElement.style.borderRadius = '8px'
                            videoElement.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8)'

                            const overlay = document.createElement('div')
                            overlay.style.position = 'fixed'
                            overlay.style.inset = '0'
                            overlay.style.backgroundColor = 'rgba(0,0,0,0.8)'
                            overlay.style.zIndex = '999'
                            overlay.style.backdropFilter = 'blur(4px)'

                            const closeVideo = () => {
                              document.body.removeChild(overlay)
                              document.body.removeChild(videoElement)
                            }

                            overlay.onclick = closeVideo
                            videoElement.onended = closeVideo

                            document.body.appendChild(overlay)
                            document.body.appendChild(videoElement)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg mb-1 truncate text-white">{video.title}</h3>
                      <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
                        {video.originalPrompt}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-white/50">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{new Date(video.createdAt).toLocaleDateString()}</span>
                        <span className="sm:hidden">{new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    {/* Template and File Size */}
                    <div className="hidden sm:flex justify-between text-xs text-white/50">
                      <span>Template: {video.template}</span>
                      <span>{formatFileSize(video.fileSize)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 sm:gap-2 pt-2">
                      {video.status === 'completed' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownload(video)}
                            className="bg-blue-500 hover:bg-blue-600 text-white flex-1 py-2 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            Download
                          </motion.button>
                          <button className="bg-white/10 hover:bg-white/20 text-white py-2 px-2 sm:px-3 rounded-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Preview</span>
                          </button>
                        </>
                      )}

                      {video.status === 'failed' && (
                        <button className="bg-blue-500 hover:bg-blue-600 text-white flex-1 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm transition-colors">
                          <span className="hidden sm:inline">Retry Generation</span>
                          <span className="sm:hidden">Retry</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(video.id)}
                        className="bg-white/10 hover:bg-red-900/20 text-red-400 py-2 px-2 sm:px-3 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
                className="text-center py-12 video-card"
              >
                <Video className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {videos.length === 0 ? 'No Videos Yet' : 'No Videos Found'}
                </h3>
                <p className="text-white/70 mb-4">
                  {videos.length === 0
                    ? "You haven't generated any videos yet. Create your first AI video now!"
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {videos.length === 0 ? (
                  <button
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-xl transition-colors"
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
                    className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% {
            filter: hue-rotate(0deg) blur(0px);
            transform: scale(1) rotate(0deg);
          }
          25% {
            filter: hue-rotate(90deg) blur(1px);
            transform: scale(1.02) rotate(0.5deg);
          }
          50% {
            filter: hue-rotate(180deg) blur(2px);
            transform: scale(1.05) rotate(1deg);
          }
          75% {
            filter: hue-rotate(270deg) blur(1px);
            transform: scale(1.02) rotate(0.5deg);
          }
        }

        /* Ensure smooth scrolling over fixed background */
        .scrollable-content {
          backdrop-filter: blur(0.5px);
          -webkit-backdrop-filter: blur(0.5px);
        }

        /* Enhanced video cards with better transparency */
        .video-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .video-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-4px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}