import { supabase } from './supabase'

export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'violation_letter' | 'complaint_response' | 'meeting_minutes' | 'monthly_report'
  title: string
  content: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UsageStats {
  violation_letters: number
  complaint_responses: number
  meeting_minutes: number
  monthly_reports: number
  total_activities: number
  current_month_activities: number
}

class UsageTrackingService {
  /**
   * Track when user generates AI content
   */
  async trackActivity(
    userId: string,
    type: UserActivity['activity_type'],
    title: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<UserActivity | null> {
    try {
      console.log(`📊 Tracking activity: ${type} for user ${userId}`)
      
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          title,
          content,
          metadata: metadata || {}
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Failed to track activity:', error)
        return null
      }

      console.log('✅ Activity tracked successfully:', data.id)
      return data
    } catch (error) {
      console.error('❌ Usage tracking error:', error)
      return null
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUserStats(userId: string): Promise<UsageStats> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, created_at')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Failed to get user stats:', error)
        return this.getEmptyStats()
      }

      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

      const stats: UsageStats = {
        violation_letters: 0,
        complaint_responses: 0,
        meeting_minutes: 0,
        monthly_reports: 0,
        total_activities: data.length,
        current_month_activities: 0
      }

      data.forEach(activity => {
        // Count by type
        switch (activity.activity_type) {
          case 'violation_letter':
            stats.violation_letters++
            break
          case 'complaint_response':
            stats.complaint_responses++
            break
          case 'meeting_minutes':
            stats.meeting_minutes++
            break
          case 'monthly_report':
            stats.monthly_reports++
            break
        }

        // Count current month activities
        const activityDate = new Date(activity.created_at)
        if (activityDate >= startOfMonth) {
          stats.current_month_activities++
        }
      })

      return stats
    } catch (error) {
      console.error('❌ Get stats error:', error)
      return this.getEmptyStats()
    }
  }

  /**
   * Get user's activity history (Pro+ only)
   */
  async getUserHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    type?: UserActivity['activity_type']
  ): Promise<UserActivity[]> {
    try {
      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (type) {
        query = query.eq('activity_type', type)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Failed to get user history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Get history error:', error)
      return []
    }
  }

  /**
   * Delete activity (allow users to clean up their history)
   */
  async deleteActivity(userId: string, activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', userId) // Ensure user can only delete their own

      if (error) {
        console.error('❌ Failed to delete activity:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Delete activity error:', error)
      return false
    }
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(userId: string, limit: number = 5): Promise<UserActivity[]> {
    return this.getUserHistory(userId, limit, 0)
  }

  private getEmptyStats(): UsageStats {
    return {
      violation_letters: 0,
      complaint_responses: 0,
      meeting_minutes: 0,
      monthly_reports: 0,
      total_activities: 0,
      current_month_activities: 0
    }
  }
}

export const usageTrackingService = new UsageTrackingService()