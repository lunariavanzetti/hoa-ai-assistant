// Paddle Webhook Handler for Automatic Subscription Updates

export default async function handler(req, res) {
  // Set CORS headers
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
    console.log('🎣 Paddle webhook received:', JSON.stringify(req.body, null, 2))

    // Simple test response to verify webhook is working
    if (req.body.event_type === 'subscription.created') {
      console.log('✅ Subscription created webhook received')
      
      // For now, just log the data - we'll add database updates next
      const subscription = req.body.data
      console.log('Customer ID:', subscription.customer_id)
      console.log('Price ID:', subscription.items?.[0]?.price?.id)
      console.log('Customer Email:', subscription.customer?.email)
      
      // TODO: Add database update logic here
      console.log('🔄 Would update user subscription in database')
    }

    res.status(200).json({ 
      received: true, 
      event_type: req.body.event_type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}