import { supabase } from './supabase'
import { paddleClient } from './paddleClient'

export interface SubscriptionHistory {
  id: string
  customerId: string
  subscriptionId: string
  priceId: string
  planName: string
  status: 'active' | 'canceled' | 'paused' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate?: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  createdAt: string
  updatedAt: string
}

export interface BillingDetails {
  customerId: string
  email: string
  currentSubscription?: SubscriptionHistory
  subscriptionHistory: SubscriptionHistory[]
  nextChargeAmount?: number
  nextChargeDate?: string
  paymentMethod?: {
    type: 'card' | 'paypal'
    last4?: string
    brand?: string
  }
}

export interface CancellationResult {
  success: boolean
  subscription: SubscriptionHistory
  effectiveDate: string
  refundAmount?: number
}

class SubscriptionService {
  /**
   * Get price ID for a subscription tier
   */
  private getTierPriceId(tier: string): string {
    const tierMap: Record<string, string> = {
      'pro': 'pri_01k1jmkp73zpywnccyq39vea1s',
      'agency': 'pri_01k1jmsk04pfsf5b34dwe5ej4a',
      'enterprise': 'pri_01k1jpk039ktrx259cas1qz0w5'
    }
    return tierMap[tier] || 'pri_01k1jmkp73zpywnccyq39vea1s'
  }

  /**
   * Get amount for a subscription tier (in cents)
   */
  private getTierAmount(tier: string): number {
    const amountMap: Record<string, number> = {
      'pro': 2900, // $29.00
      'agency': 7900, // $79.00
      'enterprise': 15900 // $159.00
    }
    return amountMap[tier] || 2900
  }

  /**
   * Check if we're in local development
   */
  private isLocalDevelopment(): boolean {
    return typeof window !== 'undefined' && window.location.hostname === 'localhost'
  }

  /**
   * Get complete billing details for a user
   */
  async getBillingDetails(userId: string): Promise<BillingDetails> {
    try {
      // Get user's current subscription data from our database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, paddle_customer_id, paddle_subscription_id, subscription_tier, subscription_status, subscription_cancelled_at')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      
      // For local development or users without subscription, return mock data
      if (!user.paddle_customer_id || this.isLocalDevelopment()) {
        return {
          customerId: user.paddle_customer_id || 'cus_mock_12345',
          email: user.email,
          currentSubscription: user.subscription_tier !== 'free' ? {
            id: 'sub_mock_12345',
            customerId: user.paddle_customer_id || 'cus_mock_12345',
            subscriptionId: user.paddle_subscription_id || 'sub_mock_12345',
            priceId: this.getTierPriceId(user.subscription_tier),
            planName: this.getPlanName(this.getTierPriceId(user.subscription_tier)),
            status: user.subscription_status === 'canceled' ? 'canceled' : 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextBillingDate: user.subscription_status !== 'canceled' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            cancelAtPeriodEnd: user.subscription_status === 'canceled',
            canceledAt: user.subscription_status === 'canceled' ? user.subscription_cancelled_at : undefined,
            amount: this.getTierAmount(user.subscription_tier),
            currency: 'USD',
            interval: 'month',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : undefined,
          subscriptionHistory: [],
          nextChargeAmount: user.subscription_status !== 'canceled' ? this.getTierAmount(user.subscription_tier) : undefined,
          nextChargeDate: user.subscription_status !== 'canceled' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          paymentMethod: {
            type: 'card',
            last4: '4242',
            brand: 'visa'
          }
        }
      }

      // For production, try to fetch from API
      try {
        const response = await fetch('/api/paddle/subscription-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: user.paddle_customer_id,
            subscriptionId: user.paddle_subscription_id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch subscription details')
        }

        const billingData = await response.json()

        return {
          customerId: user.paddle_customer_id,
          email: user.email,
          currentSubscription: billingData.currentSubscription,
          subscriptionHistory: billingData.subscriptionHistory || [],
          nextChargeAmount: billingData.nextChargeAmount,
          nextChargeDate: billingData.nextChargeDate,
          paymentMethod: billingData.paymentMethod
        }
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', apiError)
        throw new Error('Unable to fetch billing details')
      }
    } catch (error) {
      console.error('Error fetching billing details:', error)
      throw error
    }
  }

  /**
   * Cancel a subscription (at end of current period)
   */
  async cancelSubscription(userId: string, reason?: string): Promise<CancellationResult> {
    try {
      // Get user's subscription info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('paddle_customer_id, paddle_subscription_id, subscription_tier')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      if (user.subscription_tier === 'free') {
        throw new Error('No active subscription found')
      }

      const effectiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

      // For local development, skip API call
      if (this.isLocalDevelopment()) {
        // Update user status in our database
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            subscription_cancelled_at: new Date().toISOString()
          })
          .eq('id', userId)

        // Log cancellation activity
        await supabase
          .from('user_activities')
          .insert({
            user_id: userId,
            activity_type: 'subscription_canceled',
            title: `Subscription Canceled - ${user.subscription_tier}`,
            content: `Subscription will remain active until ${this.formatDate(effectiveDate)}. Reason: ${reason || 'Not provided'}`,
            metadata: {
              subscriptionId: user.paddle_subscription_id || 'mock_sub_id',
              tier: user.subscription_tier,
              effectiveDate: effectiveDate,
              reason: reason
            }
          })

        return {
          success: true,
          subscription: {
            id: user.paddle_subscription_id || 'mock_sub_id',
            customerId: user.paddle_customer_id || 'mock_cus_id',
            subscriptionId: user.paddle_subscription_id || 'mock_sub_id',
            priceId: this.getTierPriceId(user.subscription_tier),
            planName: this.getPlanName(this.getTierPriceId(user.subscription_tier)),
            status: 'canceled',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: effectiveDate,
            cancelAtPeriodEnd: true,
            canceledAt: new Date().toISOString(),
            amount: this.getTierAmount(user.subscription_tier),
            currency: 'USD',
            interval: 'month',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          effectiveDate
        }
      }

      // For production, try API call
      try {
        const response = await fetch('/api/paddle/cancel-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: user.paddle_subscription_id,
            reason: reason || 'User requested cancellation'
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to cancel subscription')
        }

        const result = await response.json()

        // Update user status in our database
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            subscription_cancelled_at: new Date().toISOString()
          })
          .eq('id', userId)

        // Log cancellation activity
        await supabase
          .from('user_activities')
          .insert({
            user_id: userId,
            activity_type: 'subscription_canceled',
            title: `Subscription Canceled - ${user.subscription_tier}`,
            content: `Subscription will remain active until ${result.effectiveDate}. Reason: ${reason || 'Not provided'}`,
            metadata: {
              subscriptionId: user.paddle_subscription_id,
              tier: user.subscription_tier,
              effectiveDate: result.effectiveDate,
              reason: reason
            }
          })

        return result
      } catch (apiError) {
        console.warn('API call failed, falling back to local mode')
        // This will fall back to the local development path above
        throw new Error('Unable to process cancellation')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  /**
   * Reactivate a canceled subscription (before end of period)
   */
  async reactivateSubscription(userId: string): Promise<{ success: boolean; subscription: SubscriptionHistory }> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('paddle_customer_id, paddle_subscription_id, subscription_tier')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      if (user.subscription_tier === 'free') {
        throw new Error('No subscription found')
      }

      // For local development, skip API call
      if (this.isLocalDevelopment()) {
        // Update user status in our database
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_cancelled_at: null
          })
          .eq('id', userId)

        return {
          success: true,
          subscription: {
            id: user.paddle_subscription_id || 'mock_sub_id',
            customerId: user.paddle_customer_id || 'mock_cus_id',
            subscriptionId: user.paddle_subscription_id || 'mock_sub_id',
            priceId: this.getTierPriceId(user.subscription_tier),
            planName: this.getPlanName(this.getTierPriceId(user.subscription_tier)),
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            amount: this.getTierAmount(user.subscription_tier),
            currency: 'USD',
            interval: 'month',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }

      // For production, try API call
      try {
        const response = await fetch('/api/paddle/reactivate-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: user.paddle_subscription_id
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to reactivate subscription')
        }

        const result = await response.json()

        // Update user status in our database
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_cancelled_at: null
          })
          .eq('id', userId)

        return result
      } catch (apiError) {
        console.warn('API call failed, falling back to local mode')
        // This will fall back to the local development path above
        throw new Error('Unable to process reactivation')
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw error
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(customerId: string): Promise<void> {
    try {
      // Open Paddle's customer portal for payment method updates
      await paddleClient.openCustomerPortal(customerId)
    } catch (error) {
      console.error('Error opening payment method update:', error)
      throw error
    }
  }

  /**
   * Download billing invoice
   */
  async downloadInvoice(invoiceId: string): Promise<string> {
    try {
      const response = await fetch('/api/paddle/download-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invoice')
      }

      const result = await response.json()
      return result.downloadUrl
    } catch (error) {
      console.error('Error downloading invoice:', error)
      throw error
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100) // Paddle amounts are in cents
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Get plan display name from price ID
   */
  getPlanName(priceId: string): string {
    const planMap: Record<string, string> = {
      // Production price IDs
      'pri_01k1jmkp73zpywnccyq39vea1s': 'Pro Monthly',
      'pri_01k1jpbkg3j1sdzfpe7wxsw4sn': 'Pro Yearly',
      'pri_01k1jmsk04pfsf5b34dwe5ej4a': 'Agency Monthly', 
      'pri_01k1jpga0vr19d1az4pgm50669': 'Agency Yearly',
      'pri_01k1jpk039ktrx259cas1qz0w5': 'Enterprise Monthly',
      'pri_01k1jmq651z0d295ex1xp52rw7': 'Enterprise Yearly',
      // Sandbox price IDs
      'pri_01k1jvam7jgeg2sjxwf6xkn8dj': 'Pro Monthly (Test)',
      'pri_01k1jv7qv20hv3a5cnc8p6jagj': 'Pro Yearly (Test)',
      'pri_01k1jvk56nj51g8nspd7q67ewh': 'Agency Monthly (Test)',
      'pri_01k1jvhvzeg489jzt4wrsvc1x3': 'Agency Yearly (Test)',
      'pri_01k1jv0xbhw0s9nz5wgrkda4ay': 'Enterprise Monthly (Test)',
      'pri_01k1jtzd01hz4dbsaq9vwx669p': 'Enterprise Yearly (Test)'
    }
    
    return planMap[priceId] || 'Unknown Plan'
  }

  /**
   * Get status color for UI display
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'text-green-600 bg-green-100',
      canceled: 'text-red-600 bg-red-100',
      paused: 'text-yellow-600 bg-yellow-100',
      past_due: 'text-orange-600 bg-orange-100',
      trialing: 'text-blue-600 bg-blue-100'
    }
    
    return colors[status] || 'text-gray-600 bg-gray-100'
  }
}

export const subscriptionService = new SubscriptionService()