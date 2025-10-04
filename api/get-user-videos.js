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

    console.log('📹 Fetching videos for email:', email)

    if (!email) {
      console.log('❌ No email provided')
      return res.status(400).json({
        error: 'Email parameter is required'
      })
    }

    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseKey) {
      console.log('❌ SUPABASE_SERVICE_ROLE_KEY is missing')
      return res.status(500).json({
        error: 'Database configuration missing'
      })
    }

    console.log('✅ Service role key found')

    // Fetch user's videos from database
    const fetchUrl = `${supabaseUrl}/rest/v1/videos?user_email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=${limit}&offset=${offset}`
    console.log('🔗 Fetching from URL:', fetchUrl)

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    })

    console.log('📡 Supabase response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Supabase error response:', errorText)

      // Return empty array if table doesn't exist yet
      if (errorText.includes('relation "videos" does not exist') || errorText.includes('relation "public.videos" does not exist')) {
        console.log('⚠️ Videos table does not exist yet')
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
        details: errorText,
        status: response.status
      })
    }

    const videos = await response.json()
    console.log(`✅ Successfully fetched ${videos.length} videos for ${email}`)

    return res.status(200).json({
      success: true,
      videos: videos,
      total: videos.length,
      limit: limit,
      offset: offset,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.log('❌ Fatal error in get-user-videos:', error.message)
    console.log('Stack trace:', error.stack)
    return res.status(500).json({
      error: 'Failed to fetch videos',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}