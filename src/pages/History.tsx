import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Copy,
  Edit3,
  Download,
  Trash2,
  Eye,
  FileText,
  AlertTriangle,
  MessageCircle,
  Users,
  Clock,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Archive,
  Tag,
  CheckSquare,
  Square,
  X,
  Loader2
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { usageTrackingService, type UserActivity } from '@/lib/usageTracking'
import { getCurrentUserPlan } from '@/lib/analytics'
import { useToast } from '@/components/ui/Toaster'
import { useNavigate } from 'react-router-dom'

type ViewMode = 'grid' | 'list'
type SortField = 'created_at' | 'title' | 'activity_type'
type SortOrder = 'asc' | 'desc'

interface FilterOptions {
  type: string[]
  dateRange: {
    start: string
    end: string
  }
  searchQuery: string
}

const ACTIVITY_ICONS = {
  violation_letter: AlertTriangle,
  complaint_response: MessageCircle,
  meeting_minutes: Users,
  monthly_report: Clock
}

const ACTIVITY_COLORS = {
  violation_letter: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  complaint_response: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  meeting_minutes: 'text-green-500 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  monthly_report: 'text-purple-500 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
}

const ACTIVITY_LABELS = {
  violation_letter: 'Violation Letter',
  complaint_response: 'Complaint Response', 
  meeting_minutes: 'Meeting Minutes',
  monthly_report: 'Monthly Report'
}

export const History: React.FC = () => {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null)
  const [editingActivity, setEditingActivity] = useState<UserActivity | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const [filters, setFilters] = useState<FilterOptions>({
    type: [],
    dateRange: { start: '', end: '' },
    searchQuery: ''
  })

  const userPlan = getCurrentUserPlan(user)
  const isPro = userPlan !== 'free'

  // Load user's activity history
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return
      
      setLoading(true)
      try {
        const history = await usageTrackingService.getUserHistory(user.id, 100, 0)
        setActivities(history)
      } catch (error) {
        console.error('Failed to load history:', error)
        showError('Load Failed', 'Could not load your content history')
      } finally {
        setLoading(false)
      }
    }

    if (isPro) {
      loadHistory()
    } else {
      setLoading(false)
    }
  }, [user?.id, isPro])

  // Filtered and sorted activities
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(query) ||
        activity.content.toLowerCase().includes(query) ||
        (activity.metadata?.resident_name && 
         activity.metadata.resident_name.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(activity => 
        filters.type.includes(activity.activity_type)
      )
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start)
      filtered = filtered.filter(activity => 
        new Date(activity.created_at) >= startDate
      )
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end)
      endDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(activity => 
        new Date(activity.created_at) <= endDate
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'activity_type':
          aValue = a.activity_type
          bValue = b.activity_type
          break
        case 'created_at':
        default:
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [activities, filters, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleCopy = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content)
      success('Copied!', `${title} copied to clipboard`)
    } catch (error) {
      showError('Copy Failed', 'Could not copy content to clipboard')
    }
  }

  const handleDownload = (activity: UserActivity) => {
    const content = `${activity.title}\n\nGenerated: ${new Date(activity.created_at).toLocaleString()}\n\n${activity.content}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activity.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Downloaded!', `${activity.title} downloaded`)
  }

  const handleEdit = (activity: UserActivity) => {
    setEditingActivity(activity)
    setEditContent(activity.content)
  }

  const handleSaveEdit = async () => {
    if (!editingActivity || !user?.id) return
    
    // For now, we'll just update the local state
    // In a full implementation, you'd have an API endpoint to update activities
    setActivities(prev => prev.map(activity => 
      activity.id === editingActivity.id 
        ? { ...activity, content: editContent }
        : activity
    ))
    
    setEditingActivity(null)
    setEditContent('')
    success('Updated!', 'Content has been updated')
  }

  const handleDelete = async (activityId: string) => {
    if (!user?.id) return
    
    const success = await usageTrackingService.deleteActivity(user.id, activityId)
    if (success) {
      setActivities(prev => prev.filter(activity => activity.id !== activityId))
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
      showError('Deleted', 'Content has been deleted')
    } else {
      showError('Delete Failed', 'Could not delete content')
    }
  }

  const handleBulkDelete = async () => {
    if (!user?.id || selectedItems.size === 0) return
    
    const deletePromises = Array.from(selectedItems).map(id => 
      usageTrackingService.deleteActivity(user.id!, id)
    )
    
    await Promise.all(deletePromises)
    setActivities(prev => prev.filter(activity => !selectedItems.has(activity.id)))
    setSelectedItems(new Set())
    success('Deleted', `${selectedItems.size} items deleted`)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredActivities.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredActivities.map(a => a.id)))
    }
  }

  const getTypeStats = () => {
    const stats = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(stats).map(([type, count]) => ({
      type: type as keyof typeof ACTIVITY_LABELS,
      count,
      label: ACTIVITY_LABELS[type as keyof typeof ACTIVITY_LABELS]
    }))
  }

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h1 className="heading-2 text-3xl mb-4">Content History</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            View and manage all your generated AI content in one place.
          </p>
        </motion.div>

        {/* Pro Upgrade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-12 text-center border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
        >
          <Archive className="w-16 h-16 text-amber-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            Content History - Pro Feature
          </h2>
          <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
            Access your complete content history with advanced search, filtering, editing, and management tools.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
            {['📄 View All Generated Content', '🔍 Advanced Search & Filters', '✏️ Edit & Update Content', '📥 Download & Export', '🗂️ Organize & Manage'].map((feature, index) => (
              <div key={index} className="bg-white/80 dark:bg-black/40 px-4 py-2 rounded-lg border border-amber-200">
                {feature}
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/pricing')}
            className="btn-primary text-lg px-8 py-4"
          >
            Upgrade to Pro - $9/month
          </button>
        </motion.div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-3xl mb-2">Content History</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your {activities.length} generated AI documents
            </p>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {getTypeStats().map(({ type, count, label }) => {
          const Icon = ACTIVITY_ICONS[type]
          const colorClass = ACTIVITY_COLORS[type]
          
          return (
            <div key={type} className={`glass-card p-4 border ${colorClass}`}>
              <div className="flex items-center gap-3">
                <Icon className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm opacity-80">{label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content, titles, residents..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 input-liquid"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="input-liquid"
            >
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="activity_type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary p-2"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <div className="space-y-2">
                    {Object.entries(ACTIVITY_LABELS).map(([type, label]) => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, type: [...prev.type, type] }))
                            } else {
                              setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }))
                            }
                          }}
                          className="rounded"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="input-liquid text-sm"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="input-liquid text-sm"
                      placeholder="End date"
                    />
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Filters</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { 
                          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          end: '' 
                        }
                      }))}
                      className="btn-secondary w-full text-sm"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { 
                          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          end: '' 
                        }
                      }))}
                      className="btn-secondary w-full text-sm"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => setFilters({ type: [], dateRange: { start: '', end: '' }, searchQuery: '' })}
                      className="btn-secondary w-full text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-blue-200 bg-blue-50/50 dark:bg-blue-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedItems.size === filteredActivities.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content List/Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="glass-card p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">Loading your content history...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {filters.searchQuery || filters.type.length > 0 || filters.dateRange.start 
                ? 'No content matches your search criteria.' 
                : 'Start creating AI content to see your history here.'}
            </p>
            {filters.searchQuery || filters.type.length > 0 || filters.dateRange.start ? (
              <button
                onClick={() => setFilters({ type: [], dateRange: { start: '', end: '' }, searchQuery: '' })}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/violations')}
                className="btn-primary"
              >
                Create Your First Letter
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {filteredActivities.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.activity_type]
              const isSelected = selectedItems.has(activity.id)
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-6 hover:shadow-lg transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => {
                        const newSelected = new Set(selectedItems)
                        if (isSelected) {
                          newSelected.delete(activity.id)
                        } else {
                          newSelected.add(activity.id)
                        }
                        setSelectedItems(newSelected)
                      }}
                      className="mt-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${ACTIVITY_COLORS[activity.activity_type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg truncate">{activity.title}</h3>
                            <p className="text-sm text-gray-500">
                              {ACTIVITY_LABELS[activity.activity_type]} • {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions Menu */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedActivity(activity)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(activity.content, activity.title)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Copy Content"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit Content"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(activity)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Content Preview */}
                      <div className="glass-surface p-4 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {activity.content.substring(0, 200)}
                          {activity.content.length > 200 && '...'}
                        </p>
                      </div>
                      
                      {/* Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs"
                            >
                              <Tag className="w-3 h-3" />
                              {String(value).substring(0, 20)}
                              {String(value).length > 20 && '...'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${ACTIVITY_COLORS[selectedActivity.activity_type]}`}>
                    {React.createElement(ACTIVITY_ICONS[selectedActivity.activity_type], { className: 'w-6 h-6' })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedActivity.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {ACTIVITY_LABELS[selectedActivity.activity_type]} • Created {new Date(selectedActivity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="glass-surface p-6 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Content</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedActivity.content}
                </div>
              </div>
              
              {/* Metadata */}
              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div className="glass-surface p-6 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3">Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedActivity.metadata).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/_/g, ' ')}
                        </dt>
                        <dd className="text-sm mt-1">{String(value)}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCopy(selectedActivity.content, selectedActivity.title)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Content
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedActivity)
                    setSelectedActivity(null)
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Content
                </button>
                <button
                  onClick={() => handleDownload(selectedActivity)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedActivity.id)
                    setSelectedActivity(null)
                  }}
                  className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Edit Content</h2>
                  <p className="text-gray-600 dark:text-gray-300">{editingActivity.title}</p>
                </div>
                <button
                  onClick={() => setEditingActivity(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="input-liquid h-96 resize-none"
                  placeholder="Edit your content..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingActivity(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}