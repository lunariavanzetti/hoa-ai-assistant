import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Play, Star, Filter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface VideoTemplate {
  id: string
  name: string
  description: string
  category: string
  previewUrl: string
  thumbnailUrl: string
  isPremium: boolean
  rating: number
  downloads: number
  duration: string
  style: string[]
}

export const VideoTemplates: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All Templates', count: 24 },
    { id: 'business', name: 'Business', count: 8 },
    { id: 'social', name: 'Social Media', count: 6 },
    { id: 'education', name: 'Education', count: 4 },
    { id: 'marketing', name: 'Marketing', count: 6 }
  ]

  const templates: VideoTemplate[] = [
    {
      id: 'modern-slideshow',
      name: 'Modern Slideshow',
      description: 'Clean, professional slideshow with smooth transitions',
      category: 'business',
      previewUrl: '/templates/modern-slideshow.mp4',
      thumbnailUrl: '/templates/thumbs/modern-slideshow.jpg',
      isPremium: false,
      rating: 4.8,
      downloads: 1247,
      duration: '30-60s',
      style: ['Professional', 'Clean', 'Corporate']
    },
    {
      id: 'dynamic-intro',
      name: 'Dynamic Intro',
      description: 'High-energy intro with animations and effects',
      category: 'marketing',
      previewUrl: '/templates/dynamic-intro.mp4',
      thumbnailUrl: '/templates/thumbs/dynamic-intro.jpg',
      isPremium: true,
      rating: 4.9,
      downloads: 2156,
      duration: '15-30s',
      style: ['Energetic', 'Modern', 'Bold']
    },
    {
      id: 'social-vertical',
      name: 'Social Vertical',
      description: 'Optimized for social media platforms (9:16 aspect ratio)',
      category: 'social',
      previewUrl: '/templates/social-vertical.mp4',
      thumbnailUrl: '/templates/thumbs/social-vertical.jpg',
      isPremium: false,
      rating: 4.7,
      downloads: 1834,
      duration: '15-45s',
      style: ['Mobile', 'Social', 'Trendy']
    },
    {
      id: 'tutorial-format',
      name: 'Tutorial Format',
      description: 'Perfect for educational and instructional content',
      category: 'education',
      previewUrl: '/templates/tutorial-format.mp4',
      thumbnailUrl: '/templates/thumbs/tutorial-format.jpg',
      isPremium: false,
      rating: 4.6,
      downloads: 987,
      duration: '60-120s',
      style: ['Educational', 'Clear', 'Step-by-step']
    },
    {
      id: 'product-showcase',
      name: 'Product Showcase',
      description: 'Highlight products with elegant animations',
      category: 'marketing',
      previewUrl: '/templates/product-showcase.mp4',
      thumbnailUrl: '/templates/thumbs/product-showcase.jpg',
      isPremium: true,
      rating: 4.9,
      downloads: 1654,
      duration: '30-45s',
      style: ['Elegant', 'Product', 'Premium']
    },
    {
      id: 'corporate-presentation',
      name: 'Corporate Presentation',
      description: 'Professional presentation template for business use',
      category: 'business',
      previewUrl: '/templates/corporate-presentation.mp4',
      thumbnailUrl: '/templates/thumbs/corporate-presentation.jpg',
      isPremium: false,
      rating: 4.5,
      downloads: 876,
      duration: '60-90s',
      style: ['Corporate', 'Formal', 'Charts']
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.style.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = (template: VideoTemplate) => {
    // Navigate to video generator with template pre-selected
    navigate('/generate', {
      state: {
        templateId: template.id,
        templateName: template.name,
        templateStyle: template.style[0].toLowerCase()
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 lg:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl glass-surface">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Video Templates</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Choose from professional templates to jumpstart your video creation
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name, style, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 min-w-[140px]"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-0 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            {/* Template Preview */}
            <div className="aspect-video bg-black relative overflow-hidden">
              {template.thumbnailUrl ? (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${template.thumbnailUrl})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                  <Video className="w-16 h-16 text-white/50" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn-primary py-2 px-4 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Preview
                </motion.button>
              </div>

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Premium
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {template.duration}
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {template.description}
                </p>
              </div>

              {/* Style Tags */}
              <div className="flex flex-wrap gap-2">
                {template.style.slice(0, 3).map((style, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                  >
                    {style}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{template.rating}</span>
                  </div>
                  <div>
                    {template.downloads.toLocaleString()} downloads
                  </div>
                </div>
                <div className="text-xs uppercase font-medium">
                  {template.category}
                </div>
              </div>

              {/* Use Template Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUseTemplate(template)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  template.isPremium
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                    : 'btn-primary'
                }`}
              >
                <Video className="w-4 h-4" />
                Use This Template
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass-card"
        >
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try adjusting your search or filter to find the perfect template.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Custom Template CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center glass-card p-8"
      >
        <h2 className="text-2xl font-bold mb-4">Need a Custom Template?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Our AI can create unique templates based on your specific requirements.
          Premium subscribers can request custom templates.
        </p>
        <button
          onClick={() => navigate('/generate')}
          className="btn-primary py-3 px-8"
        >
          Create Custom Video
        </button>
      </motion.div>
    </div>
  )
}