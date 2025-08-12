// Paddle Webhook Handler for Automatic Subscription Updates
// This API endpoint receives webhooks from Paddle when users buy/cancel subscriptions

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for database writes
)

// Paddle webhook signature verification
function verifyPaddleWebhook(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body, 'utf8')
  const expectedSignature = hmac.digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Map Paddle price IDs to subscription tiers
function getPlanTierFromPriceId(priceId) {
  const priceToTierMap = {
    // Production Price IDs
    'pri_01k1jmkp73zpywnccyq39vea1s': 'pro',    // Pro Monthly
    'pri_01k1jpbkg3j1sdzfpe7wxsw4sn': 'pro',    // Pro Yearly
    'pri_01k1jmsk04pfsf5b34dwe5ej4a': 'agency',  // Agency Monthly
    'pri_01k1jpga0vr19d1az4pgm50669': 'agency',  // Agency Yearly
    'pri_01k1jpk039ktrx259cas1qz0w5': 'enterprise', // Enterprise Monthly
    'pri_01k1jmq651z0d295ex1xp52rw7': 'enterprise', // Enterprise Yearly
    
    // Test Price IDs
    'pri_01k2emzd2qvb0w3vy8q99st8kv': 'pro',    // Test Pro Monthly
    'pri_01k2emvmk11y922j42w21e2tcs': 'pro',    // Test Pro Yearly
    'pri_01k2en14d99qw8tpzh1xdep4vc': 'agency',  // Test Agency Monthly
    'pri_01k2en5bwfwkawr1xqr1n4jywg': 'agency',  // Test Agency Yearly
  }
  
  return priceToTierMap[priceId] || 'free'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🎣 Paddle webhook received:', req.body)

    // Verify webhook signature (in production)
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['paddle-signature']
      const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET
      
      if (!signature || !webhookSecret) {
        console.error('❌ Missing webhook signature or secret')
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const isValid = verifyPaddleWebhook(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      )
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    const event = req.body
    const eventType = event.event_type

    console.log('📬 Webhook event type:', eventType)

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.activated': {
        const subscription = event.data
        const customerId = subscription.customer_id
        const priceId = subscription.items?.[0]?.price?.id
        const subscriptionId = subscription.id
        
        console.log('✅ Subscription created/activated:', {
          customerId,
          priceId,
          subscriptionId
        })
        
        // Determine subscription tier from price ID
        const tier = getPlanTierFromPriceId(priceId)
        
        if (tier === 'free') {
          console.warn('⚠️ Unknown price ID, defaulting to free:', priceId)
        }
        
        // Update user in database
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            paddle_customer_id: customerId,
            paddle_subscription_id: subscriptionId,
            updated_at: new Date().toISOString()
          })
          .eq('paddle_customer_id', customerId)
          .select()
        
        if (updateError) {
          console.error('❌ Failed to update user:', updateError)
          
          // Try to find user by email from Paddle customer data
          if (subscription.customer?.email) {
            const { data: userByEmail, error: emailError } = await supabase
              .from('users')
              .update({
                subscription_tier: tier,
                paddle_customer_id: customerId,
                paddle_subscription_id: subscriptionId,
                updated_at: new Date().toISOString()
              })
              .eq('email', subscription.customer.email)
              .select()
            
            if (emailError) {
              console.error('❌ Failed to update user by email:', emailError)
              return res.status(500).json({ error: 'Failed to update user' })
            }
            
            console.log('✅ User updated by email:', userByEmail)
          }
        } else {
          console.log('✅ User subscription updated:', updatedUser)
        }
        
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const subscription = event.data
        const subscriptionId = subscription.id
        
        console.log('❌ Subscription cancelled/expired:', subscriptionId)
        
        // Downgrade user to free tier
        const { data: downgradedUser, error: downgradeError } = await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            paddle_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('paddle_subscription_id', subscriptionId)
          .select()
        
        if (downgradeError) {
          console.error('❌ Failed to downgrade user:', downgradeError)
        } else {
          console.log('✅ User downgraded to free:', downgradedUser)
        }
        
        break
      }

      case 'subscription.updated': {
        const subscription = event.data
        const priceId = subscription.items?.[0]?.price?.id
        const subscriptionId = subscription.id
        
        console.log('🔄 Subscription updated:', subscriptionId)
        
        // Update subscription tier based on new price
        const tier = getPlanTierFromPriceId(priceId)
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            updated_at: new Date().toISOString()
          })
          .eq('paddle_subscription_id', subscriptionId)
          .select()
        
        if (updateError) {
          console.error('❌ Failed to update subscription tier:', updateError)
        } else {
          console.log('✅ Subscription tier updated:', updatedUser)
        }
        
        break
      }

      default:
        console.log('ℹ️ Unhandled webhook event:', eventType)
    }

    // Always return 200 to acknowledge webhook receipt
    res.status(200).json({ received: true })
    
  } catch (error) {
    console.error('💥 Webhook processing error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}