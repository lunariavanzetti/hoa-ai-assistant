// /api/paddle/subscription-details.js
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
    const { customerId, subscriptionId } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID required' })
    }

    // For now, we'll return mock data since we need Paddle API credentials
    // In production, this would call Paddle's API
    const mockBillingDetails = {
      currentSubscription: subscriptionId ? {
        id: subscriptionId,
        customerId: customerId,
        subscriptionId: subscriptionId,
        priceId: 'pri_01k1jmsk04pfsf5b34dwe5ej4a', // Agency monthly
        planName: 'Agency Monthly',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        amount: 7900, // $79.00 in cents
        currency: 'USD',
        interval: 'month',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : null,
      subscriptionHistory: [],
      nextChargeAmount: 7900,
      nextChargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa'
      }
    }

    res.status(200).json(mockBillingDetails)

  } catch (error) {
    console.error('Error fetching subscription details:', error)
    res.status(500).json({ 
      error: 'Failed to fetch subscription details',
      message: error.message 
    })
  }
}