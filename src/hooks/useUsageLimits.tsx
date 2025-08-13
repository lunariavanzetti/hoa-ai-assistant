import { useState } from 'react'
import { useUsageStore, PLAN_LIMITS } from '@/stores/usage'
import { useAuthStore } from '@/stores/auth'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { getCurrentUserPlan } from '@/lib/analytics'

type FeatureType = keyof typeof PLAN_LIMITS.free
type PlanTier = keyof typeof PLAN_LIMITS

interface UseUsageLimitsReturn {
  checkUsageLimit: (feature: FeatureType, action: () => void) => void
  UpgradeModalComponent: React.FC
  getRemainingUsage: (feature: FeatureType) => number
  getUsagePercentage: (feature: FeatureType) => number
  canUseFeature: (feature: FeatureType) => boolean
  getCurrentUsage: (feature: FeatureType) => number
  getFeatureLimit: (feature: FeatureType) => number
  getUserPlan: () => PlanTier
  getUsageDisplay: (feature: FeatureType) => string
}

const FEATURE_CONFIG = {
  violation_letters: {
    title: "Generate More Violation Letters",
    description: "Create unlimited professional violation letters with advanced AI templates and customization options."
  },
  complaint_responses: {
    title: "Unlimited Complaint Responses", 
    description: "Handle all resident complaints with AI-powered responses and professional templates."
  },
  meeting_summaries: {
    title: "Unlimited Meeting Summaries",
    description: "Transform all your meeting recordings into structured summaries and action items."
  },
  reports: {
    title: "Advanced Reporting",
    description: "Generate comprehensive reports with analytics, trends, and compliance tracking."
  },
  hoas: {
    title: "Manage More HOAs",
    description: "Add and manage multiple HOA properties with advanced organization features."
  }
} as const

export const useUsageLimits = (): UseUsageLimitsReturn => {
  const { user } = useAuthStore()
  const { incrementUsage, usage } = useUsageStore()
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean
    feature: FeatureType
  }>({
    isOpen: false,
    feature: 'violation_letters'
  })

  // Get user's current plan tier
  const userPlanTier = getCurrentUserPlan(user) as PlanTier

  // Get the limits for current user's plan
  const getCurrentPlanLimits = () => PLAN_LIMITS[userPlanTier] || PLAN_LIMITS.free

  const getFeatureLimit = (feature: FeatureType): number => {
    return getCurrentPlanLimits()[feature]
  }

  const getCurrentUsage = (feature: FeatureType): number => {
    return usage[feature] || 0
  }

  const getUsageDisplay = (feature: FeatureType): string => {
    const currentUsage = getCurrentUsage(feature)
    const limit = getFeatureLimit(feature)
    
    if (limit >= 999999) {
      return `${currentUsage} used this month`
    }
    
    return `${currentUsage}/${limit} used this month`
  }

  const checkUsageLimit = (feature: FeatureType, action: () => void) => {
    const currentUsage = getCurrentUsage(feature)
    const limit = getFeatureLimit(feature)
    
    // Check if user can use this feature based on their plan limits
    if (currentUsage < limit) {
      incrementUsage(feature)
      action()
    } else {
      // Show upgrade modal for free users only
      if (userPlanTier === 'free') {
        setUpgradeModal({
          isOpen: true,
          feature
        })
      } else {
        // For paid users who hit limits, just execute (shouldn't happen with 999999 limits)
        action()
      }
    }
  }

  const UpgradeModalComponent: React.FC = () => (
    <UpgradeModal
      isOpen={upgradeModal.isOpen}
      onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
      feature={upgradeModal.feature.replace('_', ' ')}
      title={FEATURE_CONFIG[upgradeModal.feature].title}
      description={FEATURE_CONFIG[upgradeModal.feature].description}
    />
  )

  const getRemainingUsage = (feature: FeatureType): number => {
    const currentUsage = getCurrentUsage(feature)
    const limit = getFeatureLimit(feature)
    return Math.max(0, limit - currentUsage)
  }

  const getUsagePercentage = (feature: FeatureType): number => {
    const currentUsage = getCurrentUsage(feature)
    const limit = getFeatureLimit(feature)
    return (currentUsage / limit) * 100
  }

  return {
    checkUsageLimit,
    UpgradeModalComponent,
    getRemainingUsage,
    getUsagePercentage,
    canUseFeature: (feature: FeatureType) => getCurrentUsage(feature) < getFeatureLimit(feature),
    getCurrentUsage,
    getFeatureLimit,
    getUserPlan: () => userPlanTier,
    getUsageDisplay
  }
}