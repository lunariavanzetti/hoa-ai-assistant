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

    console.log('🔍 Checking subscription for:', email)

    // Check if we have Paddle API credentials
    if (!process.env.PADDLE_API_KEY) {
      console.log('⚠️  No Paddle API key configured')
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
      console.log('❌ Paddle API error:', paddleResponse.status)
      return res.status(200).json({ 
        hasActiveSubscription: false,
        reason: 'Paddle API error'
      })
    }

    const subscriptions = await paddleResponse.json()
    console.log('📊 Found subscriptions:', subscriptions.data?.length || 0)

    // Find active subscription for this email
    const activeSubscription = subscriptions.data?.find(sub => 
      sub.customer?.email === email && 
      sub.status === 'active'
    )

    if (activeSubscription) {
      console.log('✅ Found active subscription for:', email)
      
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

    console.log('❌ No active subscription found for:', email)
    return res.status(200).json({ 
      hasActiveSubscription: false,
      reason: 'No active subscription found'
    })

  } catch (error) {
    console.error('💥 Check subscription error:', error)
    return res.status(500).json({ 
      error: 'Failed to check subscription',
      details: error.message
    })
  }
}