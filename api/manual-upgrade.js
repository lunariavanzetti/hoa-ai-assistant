// Manual upgrade endpoint - for immediate testing
const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, tier = 'pro' } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Only allow upgrading specific email for security
    if (email !== 'v1ktor1ach124@gmail.com') {
      return res.status(403).json({ error: 'Not authorized' })
    }

    console.log('🔄 Manual upgrade for:', email, 'to', tier)

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        paddle_subscription_id: 'manual_upgrade_' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('❌ Upgrade error:', error)
      return res.status(500).json({ 
        error: 'Failed to upgrade user',
        details: error.message 
      })
    }

    console.log('✅ User upgraded successfully:', data)
    
    res.status(200).json({
      success: true,
      message: `User upgraded to ${tier}`,
      user: data[0]
    })

  } catch (error) {
    console.error('💥 Manual upgrade error:', error)
    res.status(500).json({ 
      error: 'Upgrade failed',
      details: error.message
    })
  }
}