import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Activity,
  Star,
  Trophy,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  FileText,
  AlertTriangle,
  MessageCircle,
  Crown,
  Flame,
  ChevronRight,
  RefreshCw,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { getCurrentUserPlan } from '@/lib/analytics'
import { useToast } from '@/components/ui/Toaster'
import { useNavigate } from 'react-router-dom'
import {
  advancedAnalyticsService,
  type UsageTrend,
  type PopularFeature,
  type TimeSavedMetrics,
  type ProductivityInsights,
  type ComparisonMetrics
} from '@/lib/analyticsService'

const FEATURE_ICONS = {
  violation_letter: AlertTriangle,
  complaint_response: MessageCircle,
  meeting_minutes: Users,
  monthly_report: FileText
}

export const Analytics: React.FC = () => {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const [usageTrends, setUsageTrends] = useState<UsageTrend[]>([])
  const [popularFeatures, setPopularFeatures] = useState<PopularFeature[]>([])
  const [timeSavedMetrics, setTimeSavedMetrics] = useState<TimeSavedMetrics | null>(null)
  const [productivityInsights, setProductivityInsights] = useState<ProductivityInsights | null>(null)
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null)

  const userPlan = getCurrentUserPlan(user)
  const isPro = userPlan !== 'free'

  // Load all analytics data
  const loadAnalyticsData = async () => {
    if (!user?.id || !isPro) return

    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      
      const [trends, features, timeSaved, insights, comparison] = await Promise.all([
        advancedAnalyticsService.getUsageTrends(user.id, days, granularity),
        advancedAnalyticsService.getPopularFeatures(user.id, days),
        advancedAnalyticsService.getTimeSavedMetrics(user.id),
        advancedAnalyticsService.getProductivityInsights(user.id),
        advancedAnalyticsService.getComparisonMetrics(user.id)
      ])

      setUsageTrends(trends)
      setPopularFeatures(features)
      setTimeSavedMetrics(timeSaved)
      setProductivityInsights(insights)
      setComparisonMetrics(comparison)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      showError('Load Failed', 'Could not load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [user?.id, isPro, timeRange, granularity])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalyticsData()
    setRefreshing(false)
    success('Refreshed!', 'Analytics data updated')
  }

  const handleExport = () => {
    if (!timeSavedMetrics || !productivityInsights) return

    const exportData = {
      timeSaved: timeSavedMetrics,
      productivity: productivityInsights,
      comparison: comparisonMetrics,
      trends: usageTrends,
      features: popularFeatures,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Exported!', 'Analytics data downloaded')
  }

  const formatTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const formatGrowth = (growth: number): { icon: any, color: string, text: string } => {
    if (growth > 0) {
      return { icon: ArrowUp, color: 'text-green-500', text: `+${growth}%` }
    } else if (growth < 0) {
      return { icon: ArrowDown, color: 'text-red-500', text: `${growth}%` }
    }
    return { icon: Minus, color: 'text-gray-500', text: '0%' }
  }


  if (!isPro) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h1 className="heading-2 text-3xl mb-4">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Deep insights into your HOA management efficiency and productivity trends.
          </p>
        </motion.div>

        {/* Pro Upgrade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-12 text-center border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
        >
          <div className="relative">
            <BarChart3 className="w-20 h-20 text-purple-600 mx-auto mb-6" />
            <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
          </div>
          
          <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-4">
            Advanced Analytics - Pro Feature
          </h2>
          <p className="text-purple-700 dark:text-purple-300 mb-8 max-w-2xl mx-auto text-lg">
            Unlock powerful insights with usage trends, time-saved calculations, productivity analysis, 
            and personalized recommendations to optimize your HOA management workflow.
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { icon: TrendingUp, title: 'Usage Trends', desc: 'Track your activity patterns over time' },
              { icon: Clock, title: 'Time Saved', desc: 'See exactly how much time AI is saving you' },
              { icon: Target, title: 'Productivity Insights', desc: 'Optimize your workflow with data-driven tips' },
              { icon: Trophy, title: 'Performance Metrics', desc: 'Compare your efficiency month-over-month' },
              { icon: Lightbulb, title: 'Smart Recommendations', desc: 'Get personalized suggestions for improvement' },
              { icon: Activity, title: 'Real-time Dashboards', desc: 'Interactive charts and visualizations' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/80 dark:bg-black/40 p-6 rounded-xl border border-purple-200 dark:border-purple-700"
              >
                <feature.icon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/pricing')}
            className="btn-primary text-xl px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Crown className="w-6 h-6 mr-3" />
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
            <h1 className="heading-2 text-3xl mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Advanced Analytics
              <Crown className="w-6 h-6 text-yellow-500" />
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Deep insights into your HOA management productivity and efficiency
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Granularity */}
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as any)}
              className="input-liquid text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {/* Actions */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary p-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleExport}
              className="btn-secondary p-2"
              title="Export Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 animate-pulse mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300">Loading your analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Total Time Saved */}
            <div className="glass-card p-6 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatTime(timeSavedMetrics?.totalTimeSaved || 0)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Total Time Saved</p>
                </div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                {formatTime(timeSavedMetrics?.timeSavedThisMonth || 0)} this month
              </p>
            </div>

            {/* Efficiency Score */}
            <div className="glass-card p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {Math.round(timeSavedMetrics?.efficiency || 0)}%
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Efficiency Score</p>
                </div>
              </div>
              {comparisonMetrics && (
                <div className="flex items-center gap-1 text-xs">
                  {(() => {
                    const growth = formatGrowth(comparisonMetrics.vsLastMonth.efficiency)
                    const GrowthIcon = growth.icon
                    return (
                      <>
                        <GrowthIcon className={`w-3 h-3 ${growth.color}`} />
                        <span className={growth.color}>{growth.text} vs last month</span>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Tasks Completed */}
            <div className="glass-card p-6 border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-purple-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {timeSavedMetrics?.tasksCompleted || 0}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Tasks Completed</p>
                </div>
              </div>
              {comparisonMetrics && (
                <div className="flex items-center gap-1 text-xs">
                  {(() => {
                    const growth = formatGrowth(comparisonMetrics.vsLastMonth.usage)
                    const GrowthIcon = growth.icon
                    return (
                      <>
                        <GrowthIcon className={`w-3 h-3 ${growth.color}`} />
                        <span className={growth.color}>{growth.text} vs last month</span>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Streak Days */}
            <div className="glass-card p-6 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-amber-600" />
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {productivityInsights?.streakDays || 0}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Day Streak</p>
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Consistency: {Math.round(productivityInsights?.consistencyScore || 0)}%
              </p>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trends Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage Trends ({timeRange})
              </h3>
              
              {usageTrends.length > 0 ? (
                <div className="space-y-4">
                  {/* Simple line chart representation */}
                  <div className="h-48 flex items-end gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    {usageTrends.map((trend) => {
                      const maxValue = Math.max(...usageTrends.map(t => t.total))
                      const height = maxValue > 0 ? (trend.total / maxValue) * 100 : 0
                      
                      return (
                        <div
                          key={trend.date}
                          className="flex-1 flex flex-col justify-end"
                          title={`${trend.date}: ${trend.total} tasks`}
                        >
                          <div
                            className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '1px' }}
                          />
                          <div className="text-xs text-center mt-1 text-gray-500 truncate">
                            {granularity === 'daily' 
                              ? new Date(trend.date).getDate()
                              : granularity === 'weekly'
                              ? `W${Math.ceil(new Date(trend.date).getDate() / 7)}`
                              : new Date(trend.date).toLocaleDateString('en-US', { month: 'short' })
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                      <span>Total Activity</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No usage data for selected period</p>
                </div>
              )}
            </motion.div>

            {/* Popular Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Most Used Features
              </h3>
              
              <div className="space-y-4">
                {popularFeatures.map((feature) => {
                  const Icon = FEATURE_ICONS[feature.feature as keyof typeof FEATURE_ICONS]
                  const growth = formatGrowth(feature.growth)
                  const GrowthIcon = growth.icon
                  
                  return (
                    <div key={feature.feature} className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{feature.label}</span>
                          <span className="text-sm font-bold">{feature.count}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${feature.percentage}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs">
                            <GrowthIcon className={`w-3 h-3 ${growth.color}`} />
                            <span className={growth.color}>{growth.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Time Saved Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Saved Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {timeSavedMetrics && Object.entries(timeSavedMetrics.breakdown).map(([type, data]) => {
                const feature = popularFeatures.find(f => f.feature === type)
                const Icon = FEATURE_ICONS[type as keyof typeof FEATURE_ICONS]
                
                return (
                  <div key={type} className="text-center">
                    <div className={`inline-flex p-4 rounded-xl mb-4 ${feature?.color} bg-gray-100 dark:bg-gray-800`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold mb-2">{feature?.label}</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p><span className="font-medium">{data.count}</span> tasks</p>
                      <p><span className="font-medium">{formatTime(data.timeSaved)}</span> saved</p>
                      <p><span className="font-medium">{formatTime(Math.round(data.avgTime))}</span> avg</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Productivity Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Productivity Insights
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Insights Cards */}
              <div className="space-y-4">
                {productivityInsights && [
                  {
                    icon: Clock,
                    label: 'Peak Usage Time',
                    value: `${productivityInsights.peakUsageHour}:00`,
                    description: 'Your most productive hour'
                  },
                  {
                    icon: Calendar,
                    label: 'Peak Usage Day',
                    value: productivityInsights.peakUsageDay,
                    description: 'Your most active day of the week'
                  },
                  {
                    icon: Activity,
                    label: 'Weekly Average',
                    value: `${productivityInsights.averageTasksPerWeek} tasks`,
                    description: 'Average tasks completed per week'
                  },
                  {
                    icon: Trophy,
                    label: 'Consistency Score',
                    value: `${productivityInsights.consistencyScore}%`,
                    description: 'How consistent your usage patterns are'
                  }
                ].map((insight, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                      <insight.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{insight.value}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{insight.label}</p>
                      <p className="text-xs text-gray-500">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Personalized Recommendations
                </h4>
                <div className="space-y-3">
                  {productivityInsights?.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comparison Metrics */}
          {comparisonMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Comparison
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* vs Last Month */}
                <div>
                  <h4 className="font-semibold mb-4">vs Last Month</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Usage', value: comparisonMetrics.vsLastMonth.usage, unit: '%' },
                      { label: 'Time Saved', value: comparisonMetrics.vsLastMonth.timeSaved, unit: '%' },
                      { label: 'Efficiency', value: comparisonMetrics.vsLastMonth.efficiency, unit: '%' }
                    ].map((metric, index) => {
                      const growth = formatGrowth(metric.value)
                      const GrowthIcon = growth.icon
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-medium">{metric.label}</span>
                          <div className="flex items-center gap-2">
                            <GrowthIcon className={`w-4 h-4 ${growth.color}`} />
                            <span className={`font-semibold ${growth.color}`}>
                              {growth.text}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* All Time Stats */}
                <div>
                  <h4 className="font-semibold mb-4">All Time Performance</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">This Month Rank</span>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-yellow-800 dark:text-yellow-200">
                            #{comparisonMetrics.vsAllTime.thisMonthRank}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Best Month:</span>
                        <span className="font-medium">
                          {comparisonMetrics.vsAllTime.bestMonth || 'This month!'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Average:</span>
                        <span className="font-medium">
                          {comparisonMetrics.vsAllTime.averageMonthly} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}