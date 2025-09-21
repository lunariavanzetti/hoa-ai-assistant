// Get user's videos from database
// File: /api/get-user-videos.js

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const email = req.query.email
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    if (!email) {
      return res.status(400).json({
        error: 'Email parameter is required'
      })
    }


    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      return res.status(500).json({
        error: 'Database configuration missing'
      })
    }

    // Fetch user's videos from database
    const response = await fetch(
      `${supabaseUrl}/rest/v1/videos?user_email=eq.${email}&order=created_at.desc&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()

      // Return empty array if table doesn't exist yet
      if (errorText.includes('relation "videos" does not exist')) {
        return res.status(200).json({
          success: true,
          videos: [],
          total: 0,
          message: 'Videos table not yet created',
          timestamp: new Date().toISOString()
        })
      }

      return res.status(500).json({
        error: 'Failed to fetch videos',
        details: errorText
      })
    }

    const videos = await response.json()


    return res.status(200).json({
      success: true,
      videos: videos,
      total: videos.length,
      limit: limit,
      offset: offset,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}