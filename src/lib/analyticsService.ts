import { supabase } from './supabase'

export interface UsageTrend {
  date: string
  violation_letter: number
  complaint_response: number
  meeting_minutes: number
  monthly_report: number
  total: number
}

export interface PopularFeature {
  feature: string
  count: number
  percentage: number
  growth: number
  label: string
  icon: string
  color: string
}

export interface TimeSavedMetrics {
  totalTimeSaved: number // in minutes
  timeSavedThisMonth: number
  averageTimePerTask: number
  tasksCompleted: number
  efficiency: number
  breakdown: {
    violation_letter: { count: number, timeSaved: number, avgTime: number }
    complaint_response: { count: number, timeSaved: number, avgTime: number }
    meeting_minutes: { count: number, timeSaved: number, avgTime: number }
    monthly_report: { count: number, timeSaved: number, avgTime: number }
  }
}

export interface ProductivityInsights {
  peakUsageHour: number
  peakUsageDay: string
  mostProductiveWeek: string
  averageTasksPerWeek: number
  consistencyScore: number
  streakDays: number
  recommendations: string[]
}

export interface ComparisonMetrics {
  vsLastMonth: {
    usage: number
    timeSaved: number
    efficiency: number
  }
  vsAllTime: {
    thisMonthRank: number
    bestMonth: string
    averageMonthly: number
  }
}

// Time estimates for manual vs AI completion (in minutes)
const MANUAL_TIME_ESTIMATES = {
  violation_letter: 45, // Manual letter writing: 45 mins
  complaint_response: 30, // Manual complaint response: 30 mins
  meeting_minutes: 90, // Manual meeting minutes: 1.5 hours
  monthly_report: 180, // Manual monthly report: 3 hours
}

const AI_TIME_ESTIMATES = {
  violation_letter: 3, // AI letter: 3 mins
  complaint_response: 2, // AI response: 2 mins
  meeting_minutes: 5, // AI minutes: 5 mins
  monthly_report: 8, // AI report: 8 mins
}

class AdvancedAnalyticsService {
  /**
   * Get usage trends over time with daily/weekly/monthly granularity
   */
  async getUsageTrends(
    userId: string, 
    days: number = 30,
    granularity: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<UsageTrend[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Failed to get usage trends:', error)
        return []
      }

      // Group data by time period
      const trendsMap = new Map<string, UsageTrend>()
      
      data.forEach(activity => {
        const date = new Date(activity.created_at)
        let periodKey: string

        switch (granularity) {
          case 'weekly':
            const weekStart = new Date(date)
            weekStart.setDate(date.getDate() - date.getDay())
            periodKey = weekStart.toISOString().split('T')[0]
            break
          case 'monthly':
            periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            break
          case 'daily':
          default:
            periodKey = date.toISOString().split('T')[0]
            break
        }

        if (!trendsMap.has(periodKey)) {
          trendsMap.set(periodKey, {
            date: periodKey,
            violation_letter: 0,
            complaint_response: 0,
            meeting_minutes: 0,
            monthly_report: 0,
            total: 0
          })
        }

        const trend = trendsMap.get(periodKey)!
        trend[activity.activity_type as keyof Omit<UsageTrend, 'date' | 'total'>]++
        trend.total++
      })

      // Fill in missing dates with zero values
      const trends: UsageTrend[] = []
      const currentDate = new Date(startDate)
      const endDate = new Date()

      while (currentDate <= endDate) {
        let periodKey: string
        
        switch (granularity) {
          case 'weekly':
            const weekStart = new Date(currentDate)
            weekStart.setDate(currentDate.getDate() - currentDate.getDay())
            periodKey = weekStart.toISOString().split('T')[0]
            currentDate.setDate(currentDate.getDate() + 7)
            break
          case 'monthly':
            periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
            currentDate.setMonth(currentDate.getMonth() + 1)
            break
          case 'daily':
          default:
            periodKey = currentDate.toISOString().split('T')[0]
            currentDate.setDate(currentDate.getDate() + 1)
            break
        }

        trends.push(trendsMap.get(periodKey) || {
          date: periodKey,
          violation_letter: 0,
          complaint_response: 0,
          meeting_minutes: 0,
          monthly_report: 0,
          total: 0
        })
      }

      return trends.sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('❌ Get usage trends error:', error)
      return []
    }
  }

  /**
   * Analyze popular features with growth metrics
   */
  async getPopularFeatures(userId: string, compareWithDays: number = 30): Promise<PopularFeature[]> {
    try {
      const now = new Date()
      const compareDate = new Date(now.getTime() - compareWithDays * 24 * 60 * 60 * 1000)

      // Get current period data
      const { data: currentData, error: currentError } = await supabase
        .from('user_activities')
        .select('activity_type')
        .eq('user_id', userId)
        .gte('created_at', compareDate.toISOString())

      // Get previous period data for growth calculation
      const previousDate = new Date(compareDate.getTime() - compareWithDays * 24 * 60 * 60 * 1000)
      const { data: previousData, error: previousError } = await supabase
        .from('user_activities')
        .select('activity_type')
        .eq('user_id', userId)
        .gte('created_at', previousDate.toISOString())
        .lt('created_at', compareDate.toISOString())

      if (currentError || previousError) {
        console.error('❌ Failed to get popular features:', currentError || previousError)
        return []
      }

      // Count current period usage
      const currentCounts = currentData.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Count previous period usage
      const previousCounts = previousData.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const totalCurrent = Object.values(currentCounts).reduce((sum, count) => sum + count, 0)

      const features: PopularFeature[] = [
        {
          feature: 'violation_letters',
          label: 'Violation Letters',
          icon: 'AlertTriangle',
          color: 'text-red-500'
        },
        {
          feature: 'complaint_responses',
          label: 'Complaint Responses',
          icon: 'MessageCircle',
          color: 'text-blue-500'
        },
        {
          feature: 'meeting_minutes',
          label: 'Meeting Minutes',
          icon: 'Users',
          color: 'text-green-500'
        },
        {
          feature: 'monthly_reports',
          label: 'Monthly Reports',
          icon: 'Clock',
          color: 'text-purple-500'
        }
      ].map(feature => {
        const currentCount = currentCounts[feature.feature] || 0
        const previousCount = previousCounts[feature.feature] || 0
        const growth = previousCount > 0 
          ? ((currentCount - previousCount) / previousCount) * 100 
          : currentCount > 0 ? 100 : 0

        return {
          ...feature,
          count: currentCount,
          percentage: totalCurrent > 0 ? (currentCount / totalCurrent) * 100 : 0,
          growth: Math.round(growth * 10) / 10
        }
      }).sort((a, b) => b.count - a.count)

      return features
    } catch (error) {
      console.error('❌ Get popular features error:', error)
      return []
    }
  }

  /**
   * Calculate comprehensive time saved metrics
   */
  async getTimeSavedMetrics(userId: string): Promise<TimeSavedMetrics> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Failed to get time saved metrics:', error)
        return this.getEmptyTimeSavedMetrics()
      }

      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

      // Count activities by type
      const breakdown = {
        violation_letter: { count: 0, timeSaved: 0, avgTime: 0 },
        complaint_response: { count: 0, timeSaved: 0, avgTime: 0 },
        meeting_minutes: { count: 0, timeSaved: 0, avgTime: 0 },
        monthly_report: { count: 0, timeSaved: 0, avgTime: 0 }
      }

      let timeSavedThisMonth = 0
      let totalTimeSaved = 0

      data.forEach(activity => {
        const activityType = activity.activity_type as keyof typeof breakdown
        const manualTime = MANUAL_TIME_ESTIMATES[activityType]
        const aiTime = AI_TIME_ESTIMATES[activityType]
        const timeSaved = manualTime - aiTime

        breakdown[activityType].count++
        breakdown[activityType].timeSaved += timeSaved
        totalTimeSaved += timeSaved

        // Check if activity is from this month
        const activityDate = new Date(activity.created_at)
        if (activityDate >= startOfMonth) {
          timeSavedThisMonth += timeSaved
        }
      })

      // Calculate average times
      Object.keys(breakdown).forEach(key => {
        const type = key as keyof typeof breakdown
        if (breakdown[type].count > 0) {
          breakdown[type].avgTime = breakdown[type].timeSaved / breakdown[type].count
        }
      })

      const tasksCompleted = data.length
      const averageTimePerTask = tasksCompleted > 0 ? totalTimeSaved / tasksCompleted : 0
      
      // Efficiency score based on AI vs manual time ratio
      const totalManualTime = data.reduce((sum, activity) => {
        return sum + MANUAL_TIME_ESTIMATES[activity.activity_type as keyof typeof MANUAL_TIME_ESTIMATES]
      }, 0)
      const totalAiTime = data.reduce((sum, activity) => {
        return sum + AI_TIME_ESTIMATES[activity.activity_type as keyof typeof AI_TIME_ESTIMATES]
      }, 0)
      const efficiency = totalManualTime > 0 ? ((totalManualTime - totalAiTime) / totalManualTime) * 100 : 0

      return {
        totalTimeSaved,
        timeSavedThisMonth,
        averageTimePerTask,
        tasksCompleted,
        efficiency: Math.round(efficiency * 10) / 10,
        breakdown
      }
    } catch (error) {
      console.error('❌ Get time saved metrics error:', error)
      return this.getEmptyTimeSavedMetrics()
    }
  }

  /**
   * Get advanced productivity insights
   */
  async getProductivityInsights(userId: string): Promise<ProductivityInsights> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error || !data.length) {
        return this.getEmptyProductivityInsights()
      }

      // Analyze usage patterns
      const hourCounts = new Array(24).fill(0)
      const dayCounts = new Array(7).fill(0)
      const weekCounts = new Map<string, number>()
      
      data.forEach(activity => {
        const date = new Date(activity.created_at)
        const hour = date.getHours()
        const day = date.getDay()
        const week = this.getWeekKey(date)

        hourCounts[hour]++
        dayCounts[day]++
        weekCounts.set(week, (weekCounts.get(week) || 0) + 1)
      })

      // Find peak usage patterns
      const peakUsageHour = hourCounts.indexOf(Math.max(...hourCounts))
      const peakUsageDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        dayCounts.indexOf(Math.max(...dayCounts))
      ]

      // Find most productive week
      const mostProductiveWeek = Array.from(weekCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || ''

      // Calculate average tasks per week
      const averageTasksPerWeek = weekCounts.size > 0 
        ? Array.from(weekCounts.values()).reduce((sum, count) => sum + count, 0) / weekCounts.size
        : 0

      // Calculate consistency score (based on variance in daily usage)
      const dailyAverages = Object.values(dayCounts)
      const avgDaily = dailyAverages.reduce((sum, count) => sum + count, 0) / dailyAverages.length
      const variance = dailyAverages.reduce((sum, count) => sum + Math.pow(count - avgDaily, 2), 0) / dailyAverages.length
      const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) / avgDaily) * 20)

      // Calculate current streak
      const streakDays = this.calculateStreakDays(data)

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        peakUsageHour,
        averageTasksPerWeek,
        consistencyScore,
        streakDays,
        totalTasks: data.length
      })

      return {
        peakUsageHour,
        peakUsageDay,
        mostProductiveWeek,
        averageTasksPerWeek: Math.round(averageTasksPerWeek * 10) / 10,
        consistencyScore: Math.round(consistencyScore * 10) / 10,
        streakDays,
        recommendations
      }
    } catch (error) {
      console.error('❌ Get productivity insights error:', error)
      return this.getEmptyProductivityInsights()
    }
  }

  /**
   * Get comparison metrics vs previous periods
   */
  async getComparisonMetrics(userId: string): Promise<ComparisonMetrics> {
    try {
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      // Get this month's data
      const { data: thisMonthData, error: thisMonthError } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', thisMonthStart.toISOString())

      // Get last month's data
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', thisMonthStart.toISOString())

      // Get all time data for ranking
      const { data: allTimeData, error: allTimeError } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)

      if (thisMonthError || lastMonthError || allTimeError) {
        console.error('❌ Failed to get comparison metrics')
        return this.getEmptyComparisonMetrics()
      }

      // Calculate this month metrics
      const thisMonthUsage = thisMonthData.length
      const thisMonthTimeSaved = this.calculateTimeSaved(thisMonthData)

      // Calculate last month metrics
      const lastMonthUsage = lastMonthData.length
      const lastMonthTimeSaved = this.calculateTimeSaved(lastMonthData)

      // Calculate comparisons
      const usageChange = lastMonthUsage > 0 
        ? ((thisMonthUsage - lastMonthUsage) / lastMonthUsage) * 100 
        : thisMonthUsage > 0 ? 100 : 0

      const timeSavedChange = lastMonthTimeSaved > 0 
        ? ((thisMonthTimeSaved - lastMonthTimeSaved) / lastMonthTimeSaved) * 100 
        : thisMonthTimeSaved > 0 ? 100 : 0

      const efficiencyChange = this.calculateEfficiencyChange(thisMonthData, lastMonthData)

      // Calculate monthly rankings
      const monthlyStats = this.groupByMonth(allTimeData)
      const sortedMonths = Object.entries(monthlyStats)
        .sort((a, b) => b[1].usage - a[1].usage)

      const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const thisMonthRank = sortedMonths.findIndex(([month]) => month === thisMonthKey) + 1
      const bestMonth = sortedMonths[0]?.[0] || ''
      const averageMonthly = Object.values(monthlyStats).reduce((sum, stats) => sum + stats.usage, 0) / Object.keys(monthlyStats).length

      return {
        vsLastMonth: {
          usage: Math.round(usageChange * 10) / 10,
          timeSaved: Math.round(timeSavedChange * 10) / 10,
          efficiency: Math.round(efficiencyChange * 10) / 10
        },
        vsAllTime: {
          thisMonthRank: thisMonthRank || 1,
          bestMonth,
          averageMonthly: Math.round(averageMonthly * 10) / 10
        }
      }
    } catch (error) {
      console.error('❌ Get comparison metrics error:', error)
      return this.getEmptyComparisonMetrics()
    }
  }

  // Helper methods
  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    return `${year}-W${week}`
  }

  private calculateStreakDays(activities: any[]): number {
    if (!activities.length) return 0

    const sortedDates = activities
      .map(a => new Date(a.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 1
    const today = new Date().toDateString()
    
    if (sortedDates[0] !== today && sortedDates[0] !== new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      return 0 // No activity today or yesterday
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i])
      const previous = new Date(sortedDates[i - 1])
      const dayDiff = (previous.getTime() - current.getTime()) / (24 * 60 * 60 * 1000)
      
      if (dayDiff === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  private calculateTimeSaved(activities: any[]): number {
    return activities.reduce((total, activity) => {
      const manualTime = MANUAL_TIME_ESTIMATES[activity.activity_type as keyof typeof MANUAL_TIME_ESTIMATES] || 0
      const aiTime = AI_TIME_ESTIMATES[activity.activity_type as keyof typeof AI_TIME_ESTIMATES] || 0
      return total + (manualTime - aiTime)
    }, 0)
  }

  private calculateEfficiencyChange(thisMonthData: any[], lastMonthData: any[]): number {
    const thisMonthEfficiency = this.calculateEfficiency(thisMonthData)
    const lastMonthEfficiency = this.calculateEfficiency(lastMonthData)
    
    return lastMonthEfficiency > 0 
      ? ((thisMonthEfficiency - lastMonthEfficiency) / lastMonthEfficiency) * 100 
      : thisMonthEfficiency > 0 ? 100 : 0
  }

  private calculateEfficiency(activities: any[]): number {
    if (!activities.length) return 0
    
    const totalManualTime = activities.reduce((sum, activity) => {
      return sum + (MANUAL_TIME_ESTIMATES[activity.activity_type as keyof typeof MANUAL_TIME_ESTIMATES] || 0)
    }, 0)
    
    const totalAiTime = activities.reduce((sum, activity) => {
      return sum + (AI_TIME_ESTIMATES[activity.activity_type as keyof typeof AI_TIME_ESTIMATES] || 0)
    }, 0)
    
    return totalManualTime > 0 ? ((totalManualTime - totalAiTime) / totalManualTime) * 100 : 0
  }

  private groupByMonth(activities: any[]): Record<string, { usage: number, timeSaved: number }> {
    return activities.reduce((acc, activity) => {
      const date = new Date(activity.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { usage: 0, timeSaved: 0 }
      }
      
      acc[monthKey].usage++
      
      const manualTime = MANUAL_TIME_ESTIMATES[activity.activity_type as keyof typeof MANUAL_TIME_ESTIMATES] || 0
      const aiTime = AI_TIME_ESTIMATES[activity.activity_type as keyof typeof AI_TIME_ESTIMATES] || 0
      acc[monthKey].timeSaved += (manualTime - aiTime)
      
      return acc
    }, {} as Record<string, { usage: number, timeSaved: number }>)
  }

  private generateRecommendations(insights: {
    peakUsageHour: number
    averageTasksPerWeek: number
    consistencyScore: number
    streakDays: number
    totalTasks: number
  }): string[] {
    const recommendations: string[] = []

    if (insights.consistencyScore < 60) {
      recommendations.push("Try to establish a more consistent daily routine for better productivity")
    }

    if (insights.averageTasksPerWeek < 5) {
      recommendations.push("Consider using AI tools more frequently to maximize time savings")
    }

    if (insights.streakDays === 0) {
      recommendations.push("Start a daily habit of using at least one AI feature")
    } else if (insights.streakDays >= 7) {
      recommendations.push(`Amazing! You're on a ${insights.streakDays}-day streak. Keep it up!`)
    }

    if (insights.peakUsageHour < 9 || insights.peakUsageHour > 17) {
      recommendations.push("Consider scheduling important tasks during business hours for better focus")
    }

    if (insights.totalTasks >= 50) {
      recommendations.push("You're a power user! Consider sharing your success with other HOA managers")
    }

    if (recommendations.length === 0) {
      recommendations.push("Great work! Your usage patterns show excellent productivity habits")
    }

    return recommendations
  }

  private getEmptyTimeSavedMetrics(): TimeSavedMetrics {
    return {
      totalTimeSaved: 0,
      timeSavedThisMonth: 0,
      averageTimePerTask: 0,
      tasksCompleted: 0,
      efficiency: 0,
      breakdown: {
        violation_letter: { count: 0, timeSaved: 0, avgTime: 0 },
        complaint_response: { count: 0, timeSaved: 0, avgTime: 0 },
        meeting_minutes: { count: 0, timeSaved: 0, avgTime: 0 },
        monthly_report: { count: 0, timeSaved: 0, avgTime: 0 }
      }
    }
  }

  private getEmptyProductivityInsights(): ProductivityInsights {
    return {
      peakUsageHour: 9,
      peakUsageDay: 'Monday',
      mostProductiveWeek: '',
      averageTasksPerWeek: 0,
      consistencyScore: 0,
      streakDays: 0,
      recommendations: ['Start creating AI content to see insights here!']
    }
  }

  private getEmptyComparisonMetrics(): ComparisonMetrics {
    return {
      vsLastMonth: {
        usage: 0,
        timeSaved: 0,
        efficiency: 0
      },
      vsAllTime: {
        thisMonthRank: 1,
        bestMonth: '',
        averageMonthly: 0
      }
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService()