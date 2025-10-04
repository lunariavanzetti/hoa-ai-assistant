// Proxy endpoint to serve Veo 3 videos with API key authentication
const https = require('https')

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
    const { fileId } = req.query

    if (!fileId) {
      return res.status(400).json({ error: 'Missing fileId parameter' })
    }

    const geminiApiKey = process.env.VITE_GEMINI_API_KEY
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Video proxy not configured' })
    }

    console.log('📹 Proxying video:', fileId)

    // Download video from Veo 3 with API key
    const videoUrl = `https://generativelanguage.googleapis.com/v1beta/files/${fileId}:download?alt=media`

    const urlObj = new URL(videoUrl)
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'x-goog-api-key': geminiApiKey
      }
    }

    const videoRequest = https.request(options, (videoResponse) => {
      if (videoResponse.statusCode !== 200) {
        console.log('❌ Failed to fetch video:', videoResponse.statusCode)
        return res.status(videoResponse.statusCode).json({
          error: 'Failed to fetch video from Veo 3'
        })
      }

      // Set appropriate headers for video streaming
      res.setHeader('Content-Type', 'video/mp4')
      res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

      if (videoResponse.headers['content-length']) {
        res.setHeader('Content-Length', videoResponse.headers['content-length'])
      }

      // Pipe the video data directly to response
      videoResponse.pipe(res)
    })

    videoRequest.on('error', (error) => {
      console.log('❌ Video proxy error:', error.message)
      res.status(500).json({ error: 'Failed to proxy video' })
    })

    videoRequest.end()

  } catch (error) {
    console.log('❌ Video proxy fatal error:', error.message)
    return res.status(500).json({
      error: 'Video proxy failed',
      message: error.message
    })
  }
}
