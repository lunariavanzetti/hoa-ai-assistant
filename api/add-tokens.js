// Simple token addition API endpoint
// File: /api/add-tokens.js

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

  if (req.method === 'GET' && req.query.action === 'check-schema') {
    // Schema check functionality
    try {
      const email = req.query.email || 'temakikitemakiki@gmail.com'
      const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseKey) {
        return res.status(500).json({
          error: 'Missing Supabase service role key'
        })
      }

      // Get current user data to see the schema
      const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      })

      const responseText = await response.text()
      console.log('=== 📊 SCHEMA CHECK ===')
      console.log('Status:', response.status)
      console.log('Response:', responseText)

      if (response.ok && responseText) {
        const userData = JSON.parse(responseText)
        const availableColumns = userData.length > 0 ? Object.keys(userData[0]) : []
        console.log('Available columns:', availableColumns)
        console.log('Has tokens column:', availableColumns.includes('tokens'))

        return res.status(200).json({
          success: true,
          usersFound: userData.length,
          availableColumns: availableColumns,
          hasTokensColumn: availableColumns.includes('tokens'),
          sampleData: userData[0] || null
        })
      } else {
        return res.status(500).json({
          error: 'Failed to query users table',
          status: response.status,
          details: responseText
        })
      }
    } catch (error) {
      return res.status(500).json({
        error: 'Schema check failed',
        message: error.message
      })
    }
  }

  try {
    const email = req.query.email || 'temakikitemakiki@gmail.com'
    const tokens = parseInt(req.query.tokens) || 4

    console.log('=== 🔄 MANUAL TOKEN ADDITION ===')
    console.log('👤 Email:', email)
    console.log('➕ Tokens to add:', tokens)
    console.log('⏰ Timestamp:', new Date().toISOString())

    // Use direct Supabase URL
    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase service role key',
        note: 'Environment variable SUPABASE_SERVICE_ROLE_KEY not found'
      })
    }

    // First, check current user data to see available columns
    const getUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    })

    let currentCredits = 0
    let currentUserData = []

    if (getUserResponse.ok) {
      const userData = await getUserResponse.json()
      currentUserData = userData

      console.log('=== 👤 CURRENT USER DATA ===')
      console.log('User found:', userData.length > 0)
      if (userData.length > 0) {
        console.log('Available columns:', Object.keys(userData[0]))
        console.log('Current user data:', userData[0])
        currentCredits = userData[0].usage_stats?.credits_remaining || userData[0].video_credits || 0
      }
    }

    const newCredits = currentCredits + tokens

    // Use fetch to update the user - use valid subscription tier values
    const updateData = {
      subscription_tier: 'free', // Use a valid tier that passes constraints
      subscription_status: 'active',
      video_credits: newCredits,
      usage_stats: {
        credits_remaining: newCredits,
        videos_this_month: 0,
        total_videos_generated: 0,
        pay_per_video_purchases: 1
      },
      updated_at: new Date().toISOString()
    }

    // Try to add tokens if column exists (check error response)
    console.log('🔧 Attempting to update with basic fields first...')

    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    })

    const responseText = await response.text()
    console.log('=== 📡 DATABASE RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Response:', responseText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to update user',
        status: response.status,
        details: responseText
      })
    }

    const userData = JSON.parse(responseText)

    console.log('=== ✅ MANUAL CREDITS UPDATE SUCCESS ===')
    console.log('👤 Email:', email)
    console.log('🔄 Previous credits:', currentCredits)
    console.log('➕ Credits added:', tokens)
    console.log('📊 New total credits:', newCredits)
    console.log('🎯 Tier:', 'free')
    console.log('📅 Status:', 'active')
    console.log('👤 Updated user:', userData[0] || userData)

    return res.status(200).json({
      success: true,
      message: `Successfully added ${tokens} credits to ${email}. New total: ${newCredits}`,
      user: userData[0] || userData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error adding tokens:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}