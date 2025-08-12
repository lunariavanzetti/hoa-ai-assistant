// Vercel Serverless Function for Paddle Webhooks
// File: /api/paddle-webhook.js

module.exports = async (req, res) => {
  console.log('🎣 Webhook called:', req.method, req.url)
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'Paddle webhook endpoint is working',
      method: 'GET',
      timestamp: new Date().toISOString()
    })
  }
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ 
      error: 'Method not allowed', 
      method: req.method,
      allowed: ['GET', 'POST', 'OPTIONS']
    })
  }

  try {
    console.log('✅ POST request received')
    console.log('📦 Request body:', req.body)
    console.log('📋 Headers:', req.headers)

    const eventType = req.body?.event_type
    console.log('📬 Event type:', eventType)

    // Check environment variables
    console.log('🔧 SUPABASE_URL exists:', !!process.env.SUPABASE_URL)
    console.log('🔧 SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Missing Supabase environment variables')
      return res.status(500).json({ 
        error: 'Missing Supabase configuration',
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
    }

    if (eventType === 'subscription.created' || eventType === 'subscription.activated') {
      console.log(`🎉 ${eventType} webhook!`)
      
      const subscription = req.body.data
      const customerEmail = subscription?.customer?.email
      const paddleCustomerId = subscription?.customer?.id
      const paddleSubscriptionId = subscription?.id
      const priceId = subscription?.items?.[0]?.price?.id
      
      console.log('👤 Customer email:', customerEmail)
      console.log('🆔 Paddle Customer ID:', paddleCustomerId)
      console.log('📋 Paddle Subscription ID:', paddleSubscriptionId)
      console.log('💰 Price ID:', priceId)

      if (!customerEmail) {
        console.log('❌ No customer email found')
        return res.status(400).json({ error: 'Customer email not found' })
      }

      // Determine subscription tier based on price ID
      let subscriptionTier = 'pro' // Default to pro for any paid subscription
      if (priceId && priceId.includes('agency')) {
        subscriptionTier = 'agency'
      } else if (priceId && priceId.includes('enterprise')) {
        subscriptionTier = 'enterprise'
      }

      console.log('🎯 Determined subscription tier:', subscriptionTier)

      // Update user subscription using direct REST API call
      try {
        console.log('🔄 Attempting database update via REST API...')
        
        const updateData = {
          subscription_tier: subscriptionTier,
          subscription_status: 'active',
          paddle_customer_id: paddleCustomerId,
          paddle_subscription_id: paddleSubscriptionId,
          updated_at: new Date().toISOString()
        }

        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?email=eq.${customerEmail}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        })

        console.log('📡 Response status:', response.status)
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('💥 Database update failed:', errorText)
          return res.status(500).json({ 
            error: 'Failed to update user subscription',
            status: response.status,
            details: errorText
          })
        }

        const data = await response.json()
        console.log('✅ Database update successful:', data)
        
      } catch (dbError) {
        console.error('💥 Database connection error:', dbError)
        return res.status(500).json({ 
          error: 'Database connection failed',
          details: dbError.message,
          type: dbError.constructor.name
        })
      }
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      console.log(`🚫 ${eventType} webhook!`)
      
      const subscription = req.body.data
      const paddleSubscriptionId = subscription?.id
      
      console.log('📋 Paddle Subscription ID:', paddleSubscriptionId)

      if (paddleSubscriptionId) {
        try {
          // Downgrade user to free tier using REST API
          const updateData = {
            subscription_tier: 'free',
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          }

          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?paddle_subscription_id=eq.${paddleSubscriptionId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('💥 Database downgrade failed:', errorText)
            return res.status(500).json({ 
              error: 'Failed to downgrade user subscription',
              status: response.status,
              details: errorText
            })
          }

          const data = await response.json()
          console.log('✅ Successfully downgraded user subscription:', data)
        } catch (error) {
          console.error('💥 Database downgrade error:', error)
          return res.status(500).json({ 
            error: 'Failed to downgrade user subscription',
            details: error.message 
          })
        }
      }
    }

    res.status(200).json({
      success: true,
      received: true,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('💥 Webhook error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}