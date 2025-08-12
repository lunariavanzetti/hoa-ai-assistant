// Paddle Webhook Handler - Vercel Serverless Function

export default async function handler(req, res) {
  console.log('🎣 Webhook called with method:', req.method)
  console.log('🎣 Request headers:', req.headers)
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed', method: req.method })
  }

  try {
    console.log('🎣 Paddle webhook received')
    console.log('📦 Body:', JSON.stringify(req.body, null, 2))

    const event = req.body
    const eventType = event.event_type

    console.log('📬 Event type:', eventType)

    if (eventType === 'subscription.created') {
      console.log('✅ Subscription created event received!')
      
      const subscription = event.data
      console.log('📋 Subscription details:')
      console.log('- Customer ID:', subscription.customer_id)
      console.log('- Subscription ID:', subscription.id)
      console.log('- Price ID:', subscription.items?.[0]?.price?.id)
      console.log('- Customer email:', subscription.customer?.email)
      
      // TODO: Update user in database here
      console.log('🔄 Would update database here')
    }

    res.status(200).json({ 
      success: true,
      received: true, 
      event_type: eventType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Webhook error:', error)
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    })
  }
}