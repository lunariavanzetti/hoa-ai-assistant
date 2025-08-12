// Vercel Serverless Function for Paddle Webhooks
// File: /api/paddle-webhook.js

export default function handler(req, res) {
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

    if (eventType === 'subscription.created') {
      console.log('🎉 Subscription created webhook!')
      
      const subscription = req.body.data
      const customerEmail = subscription?.customer?.email
      const priceId = subscription?.items?.[0]?.price?.id
      
      console.log('👤 Customer email:', customerEmail)
      console.log('💰 Price ID:', priceId)
      
      // TODO: Add database update logic here
      console.log('📝 Would update user subscription in database')
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