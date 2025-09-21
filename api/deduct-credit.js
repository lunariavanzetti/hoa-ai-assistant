// Credit deduction API endpoint - CRITICAL BUSINESS LOGIC
// File: /api/deduct-credit.js

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, videoPrompt } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }


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
    const currentVideosThisMonth = user.usage_stats?.videos_this_month || 0
    const currentTotalVideos = user.usage_stats?.total_videos_generated || 0


    // Check if user has credits
    if (currentCredits <= 0) {
      return res.status(400).json({
        error: 'Insufficient credits',
        currentCredits: currentCredits
      })
    }

    // Calculate new values
    const newCredits = currentCredits - 1
    const newVideosThisMonth = currentVideosThisMonth + 1
    const newTotalVideos = currentTotalVideos + 1


    // Update user with new credit balance and stats
    const updateData = {
      video_credits: newCredits,
      usage_stats: {
        credits_remaining: newCredits,
        videos_this_month: newVideosThisMonth,
        total_videos_generated: newTotalVideos,
        pay_per_video_purchases: user.usage_stats?.pay_per_video_purchases || 0
      },
      videos_generated_this_month: newVideosThisMonth,
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
        error: 'Failed to update user credits',
        details: errorText
      })
    }

    const updatedUser = await updateResponse.json()


    return res.status(200).json({
      success: true,
      message: 'Credit deducted successfully',
      previousCredits: currentCredits,
      newBalance: newCredits,
      creditsDeducted: 1,
      videosThisMonth: newVideosThisMonth,
      totalVideosGenerated: newTotalVideos,
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