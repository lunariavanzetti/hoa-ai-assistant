import { useState } from 'react'
import { useUsageStore, FREE_PLAN_LIMITS } from '@/stores/usage'
import { useAuthStore } from '@/stores/auth'
import { UpgradeModal } from '@/components/ui/UpgradeModal'

type FeatureType = keyof typeof FREE_PLAN_LIMITS

interface UseUsageLimitsReturn {
  checkUsageLimit: (feature: FeatureType, action: () => void) => void
  UpgradeModalComponent: React.FC
  getRemainingUsage: (feature: FeatureType) => number
  getUsagePercentage: (feature: FeatureType) => number
  canUseFeature: (feature: FeatureType) => boolean
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
  }
} as const

export const useUsageLimits = (): UseUsageLimitsReturn => {
  const { user } = useAuthStore()
  const { canUseFeature, incrementUsage, getRemainingUsage, getUsagePercentage } = useUsageStore()
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean
    feature: FeatureType
  }>({
    isOpen: false,
    feature: 'violation_letters'
  })

  // Check if user has paid subscription
  const hasPaidPlan = (user as any)?.subscription_status === 'active' || 
                     (user as any)?.paddle_subscription_id // Has active Paddle subscription

  const checkUsageLimit = (feature: FeatureType, action: () => void) => {
    // If user has paid plan, allow unlimited usage
    if (hasPaidPlan) {
      action()
      return
    }

    // Check if user can use this feature
    if (canUseFeature(feature)) {
      incrementUsage(feature)
      action()
    } else {
      // Show upgrade modal
      setUpgradeModal({
        isOpen: true,
        feature
      })
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

  return {
    checkUsageLimit,
    UpgradeModalComponent,
    getRemainingUsage,
    getUsagePercentage,
    canUseFeature: hasPaidPlan ? () => true : canUseFeature
  }
}