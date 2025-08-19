// /api/paddle/cancel-subscription.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const PADDLE_API_KEY = process.env.VITE_PADDLE_ENVIRONMENT === 'production' 
  ? process.env.PADDLE_PRODUCTION_API_KEY
  : process.env.PADDLE_SANDBOX_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId, reason } = req.body

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID required' })
    }

    // In production, this would call Paddle's API to cancel the subscription
    // For now, we'll simulate the cancellation
    
    /*
    // Actual Paddle API call would look like this:
    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled_change: {
          action: 'cancel',
          effective_at: 'next_billing_period'
        }
      })
    })

    const paddleResult = await response.json()
    */

    // Mock response for now
    const effectiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const mockResult = {
      success: true,
      subscription: {
        id: subscriptionId,
        status: 'canceled',
        cancelAtPeriodEnd: true,
        canceledAt: new Date().toISOString(),
        currentPeriodEnd: effectiveDate
      },
      effectiveDate,
      refundAmount: null // No refund for cancel at period end
    }

    // Log cancellation reason for analytics
    console.log(`Subscription ${subscriptionId} canceled. Reason: ${reason || 'Not provided'}`)

    res.status(200).json(mockResult)

  } catch (error) {
    console.error('Error canceling subscription:', error)
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      message: error.message 
    })
  }
}