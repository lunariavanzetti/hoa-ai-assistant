import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Zap,
  ArrowLeft,
  LogOut,
  Play,
  Star,
  Filter,
  Search,
  Grid3X3,
  List,
  Menu,
  History,
  BarChart3,
  User
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface VideoTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnailUrl: string
  isPremium: boolean
  rating: number
  duration: string
  style: string[]
}

export const VideoTemplates: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const categories = [
    { id: 'all', name: 'All Templates', count: 24 },
    { id: 'landscape', name: 'Landscapes', count: 8 },
    { id: 'urban', name: 'Urban', count: 6 },
    { id: 'nature', name: 'Nature', count: 4 },
    { id: 'abstract', name: 'Abstract', count: 6 }
  ]

  const templates: VideoTemplate[] = [
    {
      id: '1',
      name: 'Sunset Mountains',
      description: 'Breathtaking mountain sunset with golden hour lighting',
      category: 'landscape',
      thumbnailUrl: '/templates/sunset-mountains.jpg',
      isPremium: false,
      rating: 4.8,
      duration: '10s',
      style: ['cinematic', 'warm']
    },
    {
      id: '2',
      name: 'City Night',
      description: 'Urban cityscape with neon lights and traffic',
      category: 'urban',
      thumbnailUrl: '/templates/city-night.jpg',
      isPremium: true,
      rating: 4.9,
      duration: '15s',
      style: ['modern', 'dynamic']
    },
    {
      id: '3',
      name: 'Ocean Waves',
      description: 'Peaceful ocean waves crashing on the shore',
      category: 'nature',
      thumbnailUrl: '/templates/ocean-waves.jpg',
      isPremium: false,
      rating: 4.7,
      duration: '12s',
      style: ['calm', 'natural']
    },
    {
      id: '4',
      name: 'Forest Path',
      description: 'Mystical forest path with morning light',
      category: 'nature',
      thumbnailUrl: '/templates/forest-path.jpg',
      isPremium: true,
      rating: 4.8,
      duration: '8s',
      style: ['mystical', 'green']
    },
    {
      id: '5',
      name: 'Abstract Flow',
      description: 'Colorful abstract shapes and flowing patterns',
      category: 'abstract',
      thumbnailUrl: '/templates/abstract-flow.jpg',
      isPremium: false,
      rating: 4.6,
      duration: '20s',
      style: ['colorful', 'modern']
    },
    {
      id: '6',
      name: 'Desert Dunes',
      description: 'Golden sand dunes under vast sky',
      category: 'landscape',
      thumbnailUrl: '/templates/desert-dunes.jpg',
      isPremium: true,
      rating: 4.9,
      duration: '14s',
      style: ['warm', 'vast']
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = (template: VideoTemplate) => {
    navigate('/generate', {
      state: {
        prompt: template.description,
        orientation: 'horizontal'
      }
    })
  }

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
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white mb-2">Video Templates</h1>
              <p className="text-white/70">Get inspired with our curated collection of AI video prompts</p>
            </motion.div>

            {/* Search and Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === 'list'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className={viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
            }>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center gap-4 p-4' : ''
                  }`}
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-32 h-20 flex-shrink-0' : 'aspect-video'}`}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-white/50" />
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>

                    {/* Premium badge */}
                    {template.isPremium && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                        Premium
                      </div>
                    )}
                  </div>

                  <div className={viewMode === 'list' ? 'flex-1' : 'p-4'}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium text-sm">{template.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-white/70 text-xs">{template.rating}</span>
                      </div>
                    </div>

                    <p className="text-white/60 text-xs mb-3 line-clamp-2">{template.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-xs">{template.duration}</span>
                      <div className="flex gap-1">
                        {template.style.slice(0, 2).map((style) => (
                          <span
                            key={style}
                            className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-white/70 text-lg mb-2">No templates found</h3>
                <p className="text-white/50">Try adjusting your search or category filter</p>
              </div>
            )}
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