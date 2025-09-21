// Check database schema for users table
// File: /api/check-schema.js

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


    // Use direct Supabase URL
    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Missing Supabase service role key',
        note: 'Environment variable SUPABASE_SERVICE_ROLE_KEY not found'
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

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to query user',
        status: response.status,
        details: responseText
      })
    }

    const userData = JSON.parse(responseText)


    if (userData.length > 0) {
      const user = userData[0]
      Object.keys(user).forEach(key => {
      })
    }

    return res.status(200).json({
      success: true,
      message: `Database schema check completed for ${email}`,
      usersFound: userData.length,
      availableColumns: userData.length > 0 ? Object.keys(userData[0]) : [],
      sampleData: userData[0] || null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}