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

  try {
    const email = req.query.email || 'temakikitemakiki@gmail.com'
    const tokens = parseInt(req.query.tokens) || 4

    console.log(`🔄 Adding ${tokens} tokens to ${email}`)

    // Use direct Supabase URL
    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase service role key',
        note: 'Environment variable SUPABASE_SERVICE_ROLE_KEY not found'
      })
    }

    // Use fetch to update the user
    const response = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        tokens: tokens,
        subscription_tier: 'pay_per_video',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
    })

    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response body:', responseText)

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to update user',
        status: response.status,
        details: responseText
      })
    }

    const userData = JSON.parse(responseText)

    return res.status(200).json({
      success: true,
      message: `Successfully added ${tokens} tokens to ${email}`,
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