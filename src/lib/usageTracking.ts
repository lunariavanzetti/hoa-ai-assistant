import { supabase } from './supabase'

export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'video_generated' | 'video_downloaded' | 'prompt_enhanced' | 'video_watched'
  title: string
  content: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UsageStats {
  videos_this_month: number
  total_watch_time: number
  video_downloads: number
  ai_enhancements: number
  credits_remaining: number
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
        return null
      }

      return data
    } catch (error) {
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
        return this.getEmptyStats()
      }

      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

      const stats: UsageStats = {
        videos_this_month: 0,
        total_watch_time: 0,
        video_downloads: 0,
        ai_enhancements: 0,
        credits_remaining: 100, // Default credits
        total_activities: data.length,
        current_month_activities: 0
      }

      data.forEach(activity => {
        const activityDate = new Date(activity.created_at)
        const isCurrentMonth = activityDate >= startOfMonth

        // Count by type
        switch (activity.activity_type) {
          case 'video_generated':
            if (isCurrentMonth) {
              stats.videos_this_month++
            }
            break
          case 'video_downloaded':
            stats.video_downloads++
            break
          case 'prompt_enhanced':
            stats.ai_enhancements++
            break
          case 'video_watched':
            // Add watch time from metadata if available
            if (activity.metadata?.watchTime) {
              stats.total_watch_time += activity.metadata.watchTime
            }
            break
        }

        // Count current month activities
        if (isCurrentMonth) {
          stats.current_month_activities++
        }
      })

      return stats
    } catch (error) {
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
        return []
      }

      return data || []
    } catch (error) {
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
        return false
      }

      return true
    } catch (error) {
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
      videos_this_month: 0,
      total_watch_time: 0,
      video_downloads: 0,
      ai_enhancements: 0,
      credits_remaining: 100,
      total_activities: 0,
      current_month_activities: 0
    }
  }
}

export const usageTrackingService = new UsageTrackingService()