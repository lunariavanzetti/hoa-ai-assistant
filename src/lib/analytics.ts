// Analytics tracking for Paddle integration

class AnalyticsService {
  track(event: string, properties: Record<string, any> = {}) {
    // For now, just log to console. In production, integrate with your analytics provider
    console.log('Analytics Event:', { event, properties, timestamp: new Date().toISOString() })
    
    // TODO: Integrate with your analytics provider (e.g., PostHog, Mixpanel, Google Analytics)
    // Example:
    // if (window.analytics) {
    //   window.analytics.track(event, properties)
    // }
  }

  // Track product interactions
  trackProductViewed(productName: string, tier: string, price: number, features: string[]) {
    this.track('Product Viewed', {
      product_name: productName,
      tier,
      price,
      features,
      page: 'pricing'
    })
  }

  // Track upgrade attempts
  trackUpgradeClicked(fromTier: string, toTier: string, trigger: string = 'manual') {
    this.track('Upgrade Clicked', {
      from_tier: fromTier,
      to_tier: toTier,
      trigger,
      page: window.location.pathname
    })
  }

  // Track checkout events
  trackCheckoutStarted(tier: string, price: number) {
    this.track('Checkout Started', {
      tier,
      price,
      currency: 'USD'
    })
  }

  // Track subscription events
  trackSubscriptionCreated(tier: string, price: number) {
    this.track('Subscription Created', {
      tier,
      price,
      currency: 'USD'
    })
  }

  // Track usage limit hits
  trackUsageLimitReached(type: string, currentUsage: number, limit: number) {
    this.track('Usage Limit Reached', {
      usage_type: type,
      current_usage: currentUsage,
      limit,
      percentage_used: (currentUsage / limit) * 100
    })
  }
}

export const analytics = new AnalyticsService()

// Product mapping helper
export const getPlanNameFromPriceId = (priceId: string): string => {
  const plans: Record<string, string> = {
    [import.meta.env.VITE_PADDLE_PRO_PRODUCT_ID || '']: 'Pro',
    [import.meta.env.VITE_PADDLE_AGENCY_PRODUCT_ID || '']: 'Agency',  
    [import.meta.env.VITE_PADDLE_ENTERPRISE_PRODUCT_ID || '']: 'Enterprise'
  }
  return plans[priceId] || 'Pro'
}

export const getTierFromPlanName = (planName: string): string => {
  return planName.toLowerCase()
}

// Helper function to detect user's actual subscription plan
export const getCurrentUserPlan = (user: any) => {
  // Check if user has an active subscription
  const hasActiveSubscription = (user as any)?.subscription_status === 'active' || 
                               (user as any)?.paddle_subscription_id

  if (!hasActiveSubscription) {
    return 'free'
  }

  // If they have a subscription but no specific tier, default to 'pro'
  // In a real app, you'd check the actual product ID or price ID to determine tier
  return user?.subscription_tier || 'pro'
}

export const getPlanDetails = (tier: string) => {
  const plans = {
    free: {
      name: 'Free',
      price: 0,
      limits: { letters: 5, complaints: 10, meetings: 2, reports: 1 }
    },
    pro: {
      name: 'Pro', 
      price: 9,
      limits: { letters: 50, complaints: 200, meetings: 10, reports: 5 }
    },
    agency: {
      name: 'Agency',
      price: 19, 
      limits: { letters: 999999, complaints: 999999, meetings: 999999, reports: 999999 }
    },
    enterprise: {
      name: 'Enterprise',
      price: 29,
      limits: { letters: 999999, complaints: 999999, meetings: 999999, reports: 999999 }
    }
  }
  
  return plans[tier as keyof typeof plans] || plans.free
}