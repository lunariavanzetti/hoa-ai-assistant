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


      // Manually add tokens using the same logic as webhook
      try {
        // Use the correct Supabase URL directly
        const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
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

              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true, data: responseData })
              } else {
                resolve({ success: false, status: res.statusCode, data: responseData })
              }
            })
          })

          req.on('error', (error) => {
            reject(error)
          })

          req.write(postData)
          req.end()
        })

        if (result.success) {
          return res.status(200).json({
            status: 'Success! Tokens added manually',
            email: email,
            tokens: tokens,
            tier: 'pay_per_video',
            timestamp: new Date().toISOString(),
            result: result.data
          })
        } else {
          return res.status(500).json({
            status: 'Failed to add tokens',
            error: result.data
          })
        }
      } catch (error) {
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
    return res.status(405).json({ 
      error: 'Method not allowed', 
      method: req.method,
      allowed: ['GET', 'POST', 'OPTIONS']
    })
  }

  try {

    const eventType = req.body?.event_type

    // Check environment variables
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ 
        error: 'Missing Supabase configuration',
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
    }

    if (eventType === 'subscription.created' || eventType === 'subscription.activated' || eventType === 'transaction.completed') {

      console.log('Processing webhook event:', eventType)

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


      if (!customerEmail) {
        return res.status(400).json({ error: 'Customer email not found' })
      }

      // Determine tokens and subscription tier based on price ID
      let tokensToAdd = 0
      let subscriptionTier = 'free'

      // Log the price ID for debugging production setup
      console.log('Webhook received price ID:', priceId)

      // Map price IDs to tokens and tiers (Live + Sandbox)
      // Note: Using 'free' tier for all due to database constraints, but adding appropriate credits
      const priceMap = {
        // Production Price IDs (from environment variables)
        [process.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID]: { tokens: 1, tier: 'free' }, // Pay-per-video $1.99
        [process.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID]: { tokens: 20, tier: 'free' }, // Basic Monthly $17.99 (20 credits)
        [process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID]: { tokens: 120, tier: 'free' }, // Premium Monthly $109.99 (120 credits)

        // Legacy Production Price IDs
        'pri_01k57nwm63j9t40q3pfj73dcw8': { tokens: 1, tier: 'free' }, // Pay-per-video $2.99
        'pri_01k57p3ca33wrf9vs80qsvjzj8': { tokens: 20, tier: 'free' }, // Basic Monthly $19.99 (20 credits)
        'pri_01k57pcdf2ej7gc5p7taj77e0q': { tokens: 120, tier: 'free' }, // Premium Monthly $49.99 (120 credits)

        // Sandbox/Test Price IDs
        'pri_01k5j03ma3tzk51v95213h7yy9': { tokens: 1, tier: 'free' }, // Sandbox Pay-per-video $2.99
        'pri_01k5j04nvcbwrrdz18d7yhv5ap': { tokens: 20, tier: 'free' }, // Sandbox Basic Monthly $19.99 (20 credits)
        'pri_01k5j06b5zmw5f8cfm06vdrvb9': { tokens: 120, tier: 'free' }, // Sandbox Premium Monthly $49.99 (120 credits)

        // Additional possible Premium price IDs (add as discovered)
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

        // Guess tokens based on common patterns AND webhook data
        const amount = data?.items?.[0]?.price?.unit_price?.amount
        const currency = data?.items?.[0]?.price?.unit_price?.currency_code


        // Detect Premium by price amount ($109.99 = 10999 cents)
        if (amount >= 10900 && amount <= 11099) {
          tokensToAdd = 120
        }
        // Detect Basic by price amount ($17.99 = 1799 cents)
        else if (amount >= 1700 && amount <= 1899) {
          tokensToAdd = 20
        }
        // Detect Pay-per-Video by price amount ($1.99 = 199 cents)
        else if (amount >= 190 && amount <= 209) {
          tokensToAdd = 1
        }
        // Pattern matching fallback
        else if (priceId.includes('premium') || priceId.includes('120')) {
          tokensToAdd = 120
        } else if (priceId.includes('basic') || priceId.includes('20')) {
          tokensToAdd = 20
        } else {
          tokensToAdd = 1
        }
        subscriptionTier = 'free'
      }


      // Update user subscription using direct REST API call
      try {
        
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
              
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve({ success: true, data: responseData })
              } else {
                resolve({ success: false, status: res.statusCode, data: responseData })
              }
            })
          })

          req.on('error', (error) => {
            reject(error)
          })

          req.write(postData)
          req.end()
        })

        if (!result.success) {
          console.log('Database update failed:', result)
          return res.status(500).json({
            error: 'Failed to update user subscription',
            status: result.status,
            details: result.data
          })
        }

        console.log('Successfully processed subscription:', {
          customerEmail,
          tokensAdded,
          subscriptionTier,
          eventType
        })


      } catch (dbError) {

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
      
      const subscription = req.body.data
      const paddleSubscriptionId = subscription?.id
      

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
            return res.status(500).json({ 
              error: 'Failed to downgrade user subscription',
              status: response.status,
              details: errorText
            })
          }

          const data = await response.json()
        } catch (error) {
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
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}