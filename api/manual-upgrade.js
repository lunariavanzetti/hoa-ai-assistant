// Manual user upgrade API - for when Paddle webhook fails
// File: /api/manual-upgrade.js

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const email = req.query.email || 'temakikitemakiki@gmail.com'
    const tier = req.query.tier || 'basic'
    const credits = parseInt(req.query.credits) || 20

    // Map tier names to valid database values
    const tierMap = {
      'basic': 'basic',
      'premium': 'premium',
      'pay_per_video': 'free', // Pay per video purchases stay as free tier but add credits
      'free': 'free'
    }

    const validTier = tierMap[tier] || 'free'


    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase service role key'
      })
    }

    // Get current user data
    const getUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    })

    if (!getUserResponse.ok) {
      return res.status(500).json({ error: 'Failed to get user data' })
    }

    const userData = await getUserResponse.json()
    if (userData.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userData[0]
    const currentCredits = user.usage_stats?.credits_remaining || user.video_credits || 0


    // Calculate new values (ADD credits, don't replace)
    const newCredits = currentCredits + credits

    const updateData = {
      subscription_tier: validTier,
      subscription_status: 'active',
      video_credits: newCredits,
      usage_stats: {
        credits_remaining: newCredits,
        videos_this_month: user.usage_stats?.videos_this_month || 0,
        total_videos_generated: user.usage_stats?.total_videos_generated || 0,
        pay_per_video_purchases: user.usage_stats?.pay_per_video_purchases || 0
      },
      paddle_customer_id: `manual_${Date.now()}`, // Fake customer ID for tracking
      updated_at: new Date().toISOString()
    }


    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      return res.status(500).json({
        error: 'Failed to upgrade user',
        details: errorText
      })
    }

    const updatedUser = await updateResponse.json()


    return res.status(200).json({
      success: true,
      message: `Successfully upgraded ${email} to ${validTier} tier`,
      previousCredits: currentCredits,
      creditsGranted: credits,
      newTotalCredits: newCredits,
      requestedTier: tier,
      actualTier: validTier,
      timestamp: new Date().toISOString(),
      updatedUser: updatedUser[0] || updatedUser
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}