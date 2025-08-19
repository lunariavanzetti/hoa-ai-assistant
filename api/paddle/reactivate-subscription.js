// /api/paddle/reactivate-subscription.js
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
    const { subscriptionId } = req.body

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID required' })
    }

    // In production, this would call Paddle's API to reactivate the subscription
    // For now, we'll simulate the reactivation
    
    /*
    // Actual Paddle API call would look like this:
    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduled_change: null // Remove any scheduled changes (like cancellation)
      })
    })

    const paddleResult = await response.json()
    */

    // Mock response for now
    const mockResult = {
      success: true,
      subscription: {
        id: subscriptionId,
        status: 'active',
        cancelAtPeriodEnd: false,
        canceledAt: null,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    console.log(`Subscription ${subscriptionId} reactivated`)

    res.status(200).json(mockResult)

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    res.status(500).json({ 
      error: 'Failed to reactivate subscription',
      message: error.message 
    })
  }
}