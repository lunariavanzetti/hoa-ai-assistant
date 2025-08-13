import React from 'react'
import { useUsageLimits } from '@/hooks/useUsageLimits'

interface UsageDisplayProps {
  feature: 'violation_letters' | 'complaint_responses' | 'meeting_summaries' | 'reports' | 'hoas'
  className?: string
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({ 
  feature, 
  className = "" 
}) => {
  const { getUsageDisplay, getUserPlan } = useUsageLimits()
  const userPlan = getUserPlan()
  

  const getPlanDisplay = () => {
    const plans = {
      free: 'Free Plan',
      pro: 'Pro Plan',
      agency: 'Agency Plan',
      enterprise: 'Enterprise Plan'
    }
    return plans[userPlan] || 'Free Plan'
  }

  return (
    <div className={`text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      <div className="font-medium">{getPlanDisplay()}</div>
      <div>{getUsageDisplay(feature)}</div>
    </div>
  )
}