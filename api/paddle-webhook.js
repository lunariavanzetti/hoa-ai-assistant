// Vercel Serverless Function for Paddle Webhooks
// File: /api/paddle-webhook.js

const https = require('https')

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
  
  if (req.method === 'GET') {
    // Add manual testing endpoint
    const action = req.query.action
    if (action === 'test-add-tokens') {
      const email = req.query.email || 'temakikitemakiki@gmail.com'
      const tokens = parseInt(req.query.tokens) || 2

      console.log(`🧪 MANUAL TEST: Adding ${tokens} tokens to ${email}`)
      console.log('🔧 Environment check:')
      console.log('- SUPABASE_URL:', process.env.SUPABASE_URL)
      console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

      // Manually add tokens using the same logic as webhook
      try {
        // Use the correct Supabase URL directly
        const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
        console.log('🔗 Using Supabase URL:', supabaseUrl)
        const updateData = {
          subscription_tier: 'free',
          subscription_status: 'active',
          video_credits: tokens,
          usage_stats: {
            credits_remaining: tokens,
            videos_this_month: 0,
            total_videos_generated: 0,
            pay_per_video_purchases: 1
          },
          updated_at: new Date().toISOString()
        }

        const url = new URL(`${supabaseUrl}/rest/v1/users?email=eq.${email}`)
        const postData = JSON.stringify(updateData)

        const result = await new Promise((resolve, reject) => {
          const https = require('https')
          const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'return=representation',
              'Content-Length': Buffer.byteLength(postData)
            }
          }

          const req = https.request(options, (res) => {
            let responseData = ''
            res.on('data', (chunk) => { responseData += chunk })
            res.on('end', () => {
              console.log('📡 Manual update response status:', res.statusCode)
              console.log('📡 Manual update response data:', responseData)

              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true, data: responseData })
              } else {
                resolve({ success: false, status: res.statusCode, data: responseData })
              }
            })
          })

          req.on('error', (error) => {
            console.error('💥 Manual update error:', error)
            reject(error)
          })

          req.write(postData)
          req.end()
        })

        if (result.success) {
          console.log('✅ Manual token addition successful')
          return res.status(200).json({
            status: 'Success! Tokens added manually',
            email: email,
            tokens: tokens,
            tier: 'pay_per_video',
            timestamp: new Date().toISOString(),
            result: result.data
          })
        } else {
          console.error('❌ Manual token addition failed:', result.data)
          return res.status(500).json({
            status: 'Failed to add tokens',
            error: result.data
          })
        }
      } catch (error) {
        console.error('💥 Manual test error:', error)
        return res.status(500).json({
          status: 'Manual token test failed',
          error: error.message
        })
      }
    }

    return res.status(200).json({
      status: 'Paddle webhook endpoint is working',
      method: 'GET',
      timestamp: new Date().toISOString(),
      webhook_url: 'https://hoa-ai-assistant.vercel.app/api/paddle-webhook',
      test_url: 'https://hoa-ai-assistant.vercel.app/api/paddle-webhook?action=test-add-tokens&email=temakikitemakiki@gmail.com&tokens=1'
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
    console.log('=== 🎣 PADDLE WEBHOOK RECEIVED ===')
    console.log('✅ POST request received at:', new Date().toISOString())
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2))
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2))
    console.log('🌐 Origin:', req.headers.origin)
    console.log('🔐 User-Agent:', req.headers['user-agent'])

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

    if (eventType === 'subscription.created' || eventType === 'subscription.activated' || eventType === 'transaction.completed') {
      console.log(`🎉 ${eventType} webhook!`)

      const data = req.body.data
      let customerEmail, paddleCustomerId, paddleSubscriptionId, priceId

      if (eventType === 'transaction.completed') {
        // Handle one-time purchases
        customerEmail = data?.customer?.email
        paddleCustomerId = data?.customer?.id
        priceId = data?.items?.[0]?.price?.id
      } else {
        // Handle subscriptions
        customerEmail = data?.customer?.email
        paddleCustomerId = data?.customer?.id
        paddleSubscriptionId = data?.id
        priceId = data?.items?.[0]?.price?.id
      }

      console.log('👤 Customer email:', customerEmail)
      console.log('🆔 Paddle Customer ID:', paddleCustomerId)
      console.log('📋 Paddle Subscription ID:', paddleSubscriptionId)
      console.log('💰 Price ID:', priceId)

      if (!customerEmail) {
        console.log('❌ No customer email found')
        return res.status(400).json({ error: 'Customer email not found' })
      }

      // Determine tokens and subscription tier based on price ID
      let tokensToAdd = 0
      let subscriptionTier = 'free'

      // Map price IDs to tokens and tiers (Live + Sandbox)
      // Note: Using 'free' tier for all due to database constraints, but adding appropriate credits
      const priceMap = {
        // Live/Production Price IDs
        'pri_01k57nwm63j9t40q3pfj73dcw8': { tokens: 1, tier: 'free' }, // Pay-per-video $2.99
        'pri_01k57p3ca33wrf9vs80qsvjzj8': { tokens: 20, tier: 'free' }, // Basic Monthly $19.99 (20 credits)
        'pri_01k57pcdf2ej7gc5p7taj77e0q': { tokens: 120, tier: 'free' }, // Premium Monthly $49.99 (120 credits)

        // Sandbox/Test Price IDs
        'pri_01k5j03ma3tzk51v95213h7yy9': { tokens: 1, tier: 'free' }, // Sandbox Pay-per-video $2.99
        'pri_01k5j04nvcbwrrdz18d7yhv5ap': { tokens: 20, tier: 'free' }, // Sandbox Basic Monthly $19.99 (20 credits)
        'pri_01k5j06b5zmw5f8cfm06vdrvb9': { tokens: 120, tier: 'free' }, // Sandbox Premium Monthly $49.99 (120 credits)

        // Additional possible Premium price IDs (add as discovered)
        'pri_01k5j06b5zmw5f8cfm06vdrvb9': { tokens: 120, tier: 'free' }, // Premium variant 1
        'pri_premium_monthly': { tokens: 120, tier: 'free' }, // Generic Premium
        'pri_premium_120': { tokens: 120, tier: 'free' }, // Premium 120 tokens

        // Additional possible Basic price IDs
        'pri_basic_monthly': { tokens: 20, tier: 'free' }, // Generic Basic
        'pri_basic_20': { tokens: 20, tier: 'free' } // Basic 20 tokens
      }

      const purchase = priceMap[priceId]
      if (purchase) {
        tokensToAdd = purchase.tokens
        subscriptionTier = purchase.tier
      } else {
        console.log('❌ UNKNOWN PRICE ID DETECTED:', priceId)
        console.log('🔍 Customer email:', customerEmail)
        console.log('📝 Available price IDs:', Object.keys(priceMap))
        console.log('💡 ADD THIS PRICE ID TO WEBHOOK MAPPING!')

        // Guess tokens based on common patterns
        if (priceId.includes('premium') || priceId.includes('120')) {
          tokensToAdd = 120
          console.log('🎯 Guessing Premium tier: 120 tokens')
        } else if (priceId.includes('basic') || priceId.includes('20')) {
          tokensToAdd = 20
          console.log('🎯 Guessing Basic tier: 20 tokens')
        } else {
          tokensToAdd = 1
          console.log('🎯 Guessing Pay-per-video: 1 token')
        }
        subscriptionTier = 'free'
      }

      console.log('🎯 Tokens to add:', tokensToAdd)
      console.log('🎯 Subscription tier:', subscriptionTier)

      // Update user subscription using direct REST API call
      try {
        console.log('🔄 Attempting database update via REST API...')
        
        // First, get current user data to add credits to existing balance
        const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
        const getUserUrl = new URL(`${supabaseUrl}/rest/v1/users?email=eq.${customerEmail}&select=video_credits,usage_stats`)
        const currentUserData = await new Promise((resolve, reject) => {
          const options = {
            hostname: getUserUrl.hostname,
            port: 443,
            path: getUserUrl.pathname + getUserUrl.search,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            }
          }

          const req = https.request(options, (res) => {
            let responseData = ''
            res.on('data', (chunk) => { responseData += chunk })
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(JSON.parse(responseData))
              } else {
                resolve([])
              }
            })
          })
          req.on('error', reject)
          req.end()
        })

        const currentCredits = currentUserData[0]?.usage_stats?.credits_remaining || currentUserData[0]?.video_credits || 0
        const newCreditBalance = currentCredits + tokensToAdd

        console.log('=== 📊 CREDIT UPDATE DETAILS ===')
        console.log('👤 Customer Email:', customerEmail)
        console.log('🔄 Current credits:', currentCredits)
        console.log('➕ Adding credits:', tokensToAdd)
        console.log('🎯 New credit balance:', newCreditBalance)
        console.log('🏷️ Setting tier:', subscriptionTier)
        console.log('💰 Price ID:', priceId)
        console.log('⏰ Timestamp:', new Date().toISOString())

        const updateData = {
          subscription_tier: subscriptionTier,
          subscription_status: 'active',
          paddle_customer_id: paddleCustomerId,
          video_credits: newCreditBalance,
          usage_stats: {
            credits_remaining: newCreditBalance,
            videos_this_month: currentUserData[0]?.usage_stats?.videos_this_month || 0,
            total_videos_generated: currentUserData[0]?.usage_stats?.total_videos_generated || 0,
            pay_per_video_purchases: (currentUserData[0]?.usage_stats?.pay_per_video_purchases || 0) + (subscriptionTier === 'pay_per_video' ? 1 : 0)
          },
          updated_at: new Date().toISOString()
        }

        // Add subscription ID only if it exists (for subscriptions, not one-time purchases)
        if (paddleSubscriptionId) {
          updateData.paddle_subscription_id = paddleSubscriptionId
        }

        // Use native HTTPS module for better compatibility
        const url = new URL(`${supabaseUrl}/rest/v1/users?email=eq.${customerEmail}`)
        const postData = JSON.stringify(updateData)

        const result = await new Promise((resolve, reject) => {
          const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Prefer': 'return=representation',
              'Content-Length': Buffer.byteLength(postData)
            }
          }

          const req = https.request(options, (res) => {
            let responseData = ''
            
            res.on('data', (chunk) => {
              responseData += chunk
            })
            
            res.on('end', () => {
              console.log('📡 Response status:', res.statusCode)
              console.log('📡 Response data:', responseData)
              
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true, data: responseData })
              } else {
                resolve({ success: false, status: res.statusCode, data: responseData })
              }
            })
          })

          req.on('error', (error) => {
            console.error('💥 HTTPS request error:', error)
            reject(error)
          })

          req.write(postData)
          req.end()
        })

        if (!result.success) {
          console.error('💥 Database update failed:', result.data)
          return res.status(500).json({
            error: 'Failed to update user subscription',
            status: result.status,
            details: result.data
          })
        }

        console.log('=== ✅ WEBHOOK SUCCESS ===')
        console.log('🎉 Database update successful!')
        console.log('👤 Customer:', customerEmail)
        console.log('📊 Final credits:', newCreditBalance)
        console.log('🎯 Final tier:', subscriptionTier)
        console.log('📅 Status:', 'active')
        console.log('💾 Database response:', result.data)
        
      } catch (dbError) {
        console.error('💥 Database connection error:', dbError)
        console.error('⚠️  FALLBACK: Logging purchase for manual processing')
        console.log(`🔔 TOKENS PURCHASED: ${customerEmail} -> +${tokensToAdd} tokens, tier: ${subscriptionTier} (Paddle Sub: ${paddleSubscriptionId})`)

        // Return success since we've logged the event for manual processing
        return res.status(200).json({
          success: true,
          fallback: true,
          message: 'Purchase logged for manual processing',
          customer_email: customerEmail,
          subscription_tier: subscriptionTier,
          tokens_added: tokensToAdd,
          paddle_subscription_id: paddleSubscriptionId,
          timestamp: new Date().toISOString()
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

          const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
          const response = await fetch(`${supabaseUrl}/rest/v1/users?paddle_subscription_id=eq.${paddleSubscriptionId}`, {
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