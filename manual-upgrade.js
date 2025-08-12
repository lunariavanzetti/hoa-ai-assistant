// Manual Subscription Upgrade Script
// Run this when you see subscription events in Vercel logs

const { createClient } = require('@supabase/supabase-js')

// Your Supabase configuration
const SUPABASE_URL = 'https://rpgktwvxobbgcxpjpmke.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'your_service_role_key_here' // Replace with your actual key

async function upgradeUser(email, subscriptionTier = 'pro', paddleSubscriptionId = null) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  try {
    console.log(`🔄 Upgrading user: ${email} to ${subscriptionTier}`)
    
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: subscriptionTier,
        subscription_status: 'active',
        paddle_subscription_id: paddleSubscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('❌ Error:', error.message)
      return false
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully upgraded user:', data[0])
      return true
    } else {
      console.log('⚠️  No user found with email:', email)
      return false
    }
  } catch (error) {
    console.error('💥 Error upgrading user:', error.message)
    return false
  }
}

// Example usage:
// node manual-upgrade.js

async function main() {
  // Replace these with actual values from webhook logs
  const examples = [
    {
      email: 'v1ktor1ach124@gmail.com',
      tier: 'pro',
      paddleId: 'sub_real_upgrade'
    }
  ]

  console.log('🚀 Manual Subscription Upgrade Tool')
  console.log('===================================')
  
  for (const user of examples) {
    await upgradeUser(user.email, user.tier, user.paddleId)
    console.log('---')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { upgradeUser }