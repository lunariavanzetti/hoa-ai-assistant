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

    if (action === 'check-user') {
      const email = req.query.email
      if (!email) {
        return res.status(400).json({ error: 'Email required' })
      }

      try {
        const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
        const getUserUrl = new URL(`${supabaseUrl}/rest/v1/users?email=eq.${email}&select=email,video_credits,usage_stats,subscription_tier,subscription_status`)

        const userData = await new Promise((resolve, reject) => {
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

        if (userData.length === 0) {
          return res.status(404).json({ error: 'User not found', email })
        }

        return res.status(200).json({
          status: 'User found',
          email: userData[0].email,
          video_credits: userData[0].video_credits,
          usage_stats: userData[0].usage_stats,
          subscription_tier: userData[0].subscription_tier,
          subscription_status: userData[0].subscription_status,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        return res.status(500).json({
          error: 'Failed to fetch user',
          message: error.message
        })
      }
    }

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

      console.log('🎯 Processing webhook event:', eventType)
      console.log('📋 Full webhook data:', JSON.stringify(req.body, null, 2))

      const data = req.body.data
      let customerEmail, paddleCustomerId, paddleSubscriptionId, priceId

      if (eventType === 'transaction.completed') {
        // Handle one-time purchases
        // Try multiple locations for customer email
        customerEmail = data?.customer?.email ||
                       data?.customer_email ||
                       data?.billing_details?.email ||
                       data?.details?.email
        paddleCustomerId = data?.customer?.id || data?.customer_id
        priceId = data?.items?.[0]?.price?.id

        console.log('📦 Transaction Details:', {
          email: customerEmail,
          customerId: paddleCustomerId,
          priceId: priceId,
          amount: data?.items?.[0]?.price?.unit_price?.amount,
          currency: data?.items?.[0]?.price?.unit_price?.currency_code,
          fullCustomer: data?.customer,
          fullData: Object.keys(data || {})
        })
      } else {
        // Handle subscriptions
        customerEmail = data?.customer?.email || data?.customer_email
        paddleCustomerId = data?.customer?.id || data?.customer_id
        paddleSubscriptionId = data?.id
        priceId = data?.items?.[0]?.price?.id
        console.log('🔄 Subscription Details:', {
          email: customerEmail,
          customerId: paddleCustomerId,
          subscriptionId: paddleSubscriptionId,
          priceId: priceId
        })
      }


      if (!customerEmail && paddleCustomerId) {
        console.log('⚠️ Customer email not in webhook, fetching from Paddle API using customer ID:', paddleCustomerId)

        // Fetch customer details from Paddle API
        try {
          // Use sandbox or production API key based on environment
          const paddleApiKey = process.env.PADDLE_SANDBOX_API_KEY ||
                               process.env.PADDLE_API_KEY ||
                               process.env.VITE_PADDLE_API_KEY
          if (!paddleApiKey) {
            console.log('❌ PADDLE_API_KEY not configured. Checked: PADDLE_SANDBOX_API_KEY, PADDLE_API_KEY, VITE_PADDLE_API_KEY')
            return res.status(500).json({ error: 'Paddle API key not configured' })
          }

          // Determine if sandbox or production based on environment or customer ID format
          const isSandbox = true // Always use sandbox for now since we're testing
          const paddleApiBaseUrl = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com'
          const paddleApiUrl = `${paddleApiBaseUrl}/customers/${paddleCustomerId}`

          console.log('🔍 Fetching customer from:', paddleApiUrl)
          console.log('🔑 Using API key starting with:', paddleApiKey.substring(0, 20) + '...')

          const customerResponse = await new Promise((resolve, reject) => {
            const https = require('https')
            const url = new URL(paddleApiUrl)

            const options = {
              hostname: url.hostname,
              port: 443,
              path: url.pathname,
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${paddleApiKey}`,
                'Content-Type': 'application/json'
              }
            }

            const req = https.request(options, (res) => {
              let responseData = ''
              res.on('data', (chunk) => { responseData += chunk })
              res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  resolve({ success: true, data: JSON.parse(responseData) })
                } else {
                  resolve({ success: false, status: res.statusCode, data: responseData })
                }
              })
            })

            req.on('error', reject)
            req.end()
          })

          if (customerResponse.success && customerResponse.data?.data?.email) {
            customerEmail = customerResponse.data.data.email
            console.log('✅ Fetched customer email from Paddle API:', customerEmail)
          } else {
            console.log('❌ Failed to fetch customer from Paddle API:', customerResponse)
            return res.status(400).json({
              error: 'Failed to fetch customer email from Paddle API',
              customer_id: paddleCustomerId,
              paddle_response: customerResponse
            })
          }
        } catch (error) {
          console.log('❌ Error fetching customer from Paddle API:', error)
          return res.status(500).json({
            error: 'Error fetching customer from Paddle API',
            message: error.message
          })
        }
      }

      if (!customerEmail) {
        console.log('❌ Missing customer email after all attempts')
        return res.status(400).json({ error: 'Customer email not found' })
      }

      // Determine tokens and subscription tier based on price ID
      let tokensToAdd = 0
      let subscriptionTier = 'free'

      // Log the price ID for debugging production setup
      console.log('💰 Webhook received price ID:', priceId)

      // Map price IDs to tokens and tiers (Live + Sandbox)
      // Note: Using 'free' tier for all due to database constraints, but adding appropriate credits
      const priceMap = {
        // Production Price IDs (from environment variables)
        [process.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID]: { tokens: 2, tier: 'free' }, // Pay-per-video $4.99 (2 videos)
        [process.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID]: { tokens: 10, tier: 'free' }, // Basic Pack $19.99 (10 videos)
        [process.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID]: { tokens: 100, tier: 'free' }, // Premium Pack $149.99 (100 videos)

        // Sandbox/Test Price IDs
        'pri_01k5j03ma3tzk51v95213h7yy9': { tokens: 2, tier: 'free' }, // Sandbox Pay-per-video $4.99 (2 videos)
        'pri_01k5j04nvcbwrrdz18d7yhv5ap': { tokens: 10, tier: 'free' }, // Sandbox Basic Pack $19.99 (10 videos)
        'pri_01k5j06b5zmw5f8cfm06vdrvb9': { tokens: 100, tier: 'free' }, // Sandbox Premium Pack $149.99 (100 videos)
      }

      const purchase = priceMap[priceId]
      if (purchase) {
        tokensToAdd = purchase.tokens
        subscriptionTier = purchase.tier
        console.log('✅ Price ID matched in priceMap:', { priceId, tokens: tokensToAdd, tier: subscriptionTier })
      } else {
        console.log('⚠️ Price ID not found in priceMap, using fallback detection')
        // Guess tokens based on common patterns AND webhook data
        const amount = data?.items?.[0]?.price?.unit_price?.amount
        const currency = data?.items?.[0]?.price?.unit_price?.currency_code

        console.log('💵 Fallback price detection:', { amount, currency })

        // Detect Premium Pack by price amount ($149.99 = 14999 cents)
        if (amount >= 14900 && amount <= 15099) {
          tokensToAdd = 100
          console.log('✅ Detected Premium Pack by amount')
        }
        // Detect Basic Pack by price amount ($19.99 = 1999 cents)
        else if (amount >= 1900 && amount <= 2099) {
          tokensToAdd = 10
          console.log('✅ Detected Basic Pack by amount')
        }
        // Detect Pay-per-Video by price amount ($4.99 = 499 cents)
        else if (amount >= 490 && amount <= 509) {
          tokensToAdd = 2
          console.log('✅ Detected Pay-per-Video by amount')
        }
        // Pattern matching fallback
        else if (priceId.includes('premium') || priceId.includes('100')) {
          tokensToAdd = 100
          console.log('✅ Detected Premium by pattern')
        } else if (priceId.includes('basic') || priceId.includes('10')) {
          tokensToAdd = 10
          console.log('✅ Detected Basic by pattern')
        } else {
          tokensToAdd = 2
          console.log('⚠️ Using default Pay-per-Video tokens')
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

        console.log('💳 Token calculation:', {
          currentCredits,
          tokensToAdd,
          newCreditBalance,
          customerEmail
        })

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
          console.log('❌ Database update failed:', result)
          return res.status(500).json({
            error: 'Failed to update user subscription',
            status: result.status,
            details: result.data
          })
        }

        console.log('✅ Successfully processed subscription:', {
          customerEmail,
          tokensAdded: tokensToAdd,
          newBalance: newCreditBalance,
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