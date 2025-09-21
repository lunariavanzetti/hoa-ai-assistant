// Check user subscription status with Paddle
// This runs client-side so it can access Supabase directly

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }


    // Check if we have Paddle API credentials
    if (!process.env.PADDLE_API_KEY) {
      return res.status(200).json({ 
        hasActiveSubscription: false,
        reason: 'No Paddle API key configured'
      })
    }

    // Use Paddle API to check for active subscriptions by email
    const paddleResponse = await fetch('https://api.paddle.com/subscriptions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!paddleResponse.ok) {
      return res.status(200).json({ 
        hasActiveSubscription: false,
        reason: 'Paddle API error'
      })
    }

    const subscriptions = await paddleResponse.json()

    // Find any subscription for this email (not just active ones)
    const userSubscriptions = subscriptions.data?.filter(sub => 
      sub.customer?.email === email
    )
    
    if (userSubscriptions?.length > 0) {
    }

    // Find active subscription for this email
    const activeSubscription = userSubscriptions?.find(sub => 
      sub.status === 'active'
    )

    if (activeSubscription) {
      
      // Determine subscription tier based on price ID
      const priceId = activeSubscription.items?.[0]?.price?.id
      let subscriptionTier = 'pro' // Default to pro
      
      if (priceId && priceId.includes('agency')) {
        subscriptionTier = 'agency'
      } else if (priceId && priceId.includes('enterprise')) {
        subscriptionTier = 'enterprise'
      }

      return res.status(200).json({
        hasActiveSubscription: true,
        subscriptionTier,
        paddleCustomerId: activeSubscription.customer?.id,
        paddleSubscriptionId: activeSubscription.id,
        priceId
      })
    }

    return res.status(200).json({ 
      hasActiveSubscription: false,
      reason: 'No active subscription found'
    })

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to check subscription',
      details: error.message
    })
  }
}