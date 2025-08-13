import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Usage limits by plan tier
export const PLAN_LIMITS = {
  free: {
    violation_letters: 5,
    complaint_responses: 10,
    meeting_summaries: 2,
    reports: 1,
    hoas: 1
  },
  pro: {
    violation_letters: 50,
    complaint_responses: 200,
    meeting_summaries: 10,
    reports: 5,
    hoas: 10
  },
  agency: {
    violation_letters: 999999,
    complaint_responses: 999999,
    meeting_summaries: 999999,
    reports: 999999,
    hoas: 999999
  },
  enterprise: {
    violation_letters: 999999,
    complaint_responses: 999999,
    meeting_summaries: 999999,
    reports: 999999,
    hoas: 999999
  }
} as const

// Keep backward compatibility
export const FREE_PLAN_LIMITS = PLAN_LIMITS.free

// Reset on first day of each month
const getMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth()}`
}

interface UsageState {
  // Current month usage
  usage: {
    violation_letters: number
    complaint_responses: number
    meeting_summaries: number
    reports: number
    hoas: number
  }
  
  // Track monthly reset
  monthKey: string
  
  // Actions
  incrementUsage: (feature: keyof typeof FREE_PLAN_LIMITS) => void
  canUseFeature: (feature: keyof typeof FREE_PLAN_LIMITS) => boolean
  getRemainingUsage: (feature: keyof typeof FREE_PLAN_LIMITS) => number
  resetIfNewMonth: () => void
  getUsagePercentage: (feature: keyof typeof FREE_PLAN_LIMITS) => number
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      usage: {
        violation_letters: 0,
        complaint_responses: 0,
        meeting_summaries: 0,
        reports: 0,
        hoas: 0
      },
      monthKey: getMonthKey(),

      resetIfNewMonth: () => {
        const currentMonthKey = getMonthKey()
        const state = get()
        
        if (state.monthKey !== currentMonthKey) {
          set({
            usage: {
              violation_letters: 0,
              complaint_responses: 0,
              meeting_summaries: 0,
              reports: 0,
              hoas: 0
            },
            monthKey: currentMonthKey
          })
        }
      },

      incrementUsage: (feature) => {
        const state = get()
        state.resetIfNewMonth()
        
        set({
          usage: {
            ...state.usage,
            [feature]: state.usage[feature] + 1
          }
        })
      },

      canUseFeature: (feature) => {
        const state = get()
        state.resetIfNewMonth()
        return state.usage[feature] < FREE_PLAN_LIMITS[feature]
      },

      getRemainingUsage: (feature) => {
        const state = get()
        state.resetIfNewMonth()
        return Math.max(0, FREE_PLAN_LIMITS[feature] - state.usage[feature])
      },

      getUsagePercentage: (feature) => {
        const state = get()
        state.resetIfNewMonth()
        return (state.usage[feature] / FREE_PLAN_LIMITS[feature]) * 100
      }
    }),
    {
      name: 'usage-storage'
    }
  )
)