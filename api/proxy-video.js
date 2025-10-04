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
      // Handle redirects (302, 301, 307, 308)
      if (videoResponse.statusCode >= 300 && videoResponse.statusCode < 400 && videoResponse.headers.location) {
        console.log('🔄 Following redirect to:', videoResponse.headers.location)

        const redirectUrl = new URL(videoResponse.headers.location)
        const redirectOptions = {
          hostname: redirectUrl.hostname,
          port: 443,
          path: redirectUrl.pathname + redirectUrl.search,
          method: 'GET',
          headers: {
            'x-goog-api-key': geminiApiKey
          }
        }

        const redirectRequest = https.request(redirectOptions, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            console.log('❌ Failed to fetch video from redirect:', redirectResponse.statusCode)
            return res.status(redirectResponse.statusCode).json({
              error: 'Failed to fetch video from redirect'
            })
          }

          // Set appropriate headers for video streaming
          res.setHeader('Content-Type', 'video/mp4')
          res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

          if (redirectResponse.headers['content-length']) {
            res.setHeader('Content-Length', redirectResponse.headers['content-length'])
          }

          // Pipe the video data directly to response
          redirectResponse.pipe(res)
        })

        redirectRequest.on('error', (error) => {
          console.log('❌ Redirect request error:', error.message)
          res.status(500).json({ error: 'Failed to fetch redirected video' })
        })

        redirectRequest.end()
        return
      }

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
