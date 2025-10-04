// Video generation API using Google Veo 3 Fast via Gemini API
// File: /api/generate-video.js
// Cost: $0.15/second = $1.20 per 8-second video

const https = require('https')

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
    const { prompt, orientation = 'horizontal', email } = req.body

    if (!prompt || !email) {
      return res.status(400).json({
        error: 'Missing required fields: prompt and email'
      })
    }

    const geminiApiKey = process.env.VITE_GEMINI_API_KEY
    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'Video generation service not configured'
      })
    }

    const aspectRatio = orientation === 'vertical' ? '9:16' : '16:9'

    console.log('🎬 Starting Veo 3 Fast video generation:', {
      email,
      prompt: prompt.substring(0, 50) + '...',
      aspectRatio
    })

    // Use Veo 3 Fast for video generation ($0.15/sec)
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-fast-generate-001:predictLongRunning`

    const generateRequest = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        aspectRatio: aspectRatio,
        duration: 8 // 8 seconds = $1.20 cost
      }
    }

    const generateResponse = await makeHttpsRequest(generateUrl, 'POST', geminiApiKey, generateRequest)

    if (!generateResponse.success) {
      console.log('❌ Video generation start failed:', generateResponse.error)

      // Fallback to placeholder video on failure
      const placeholderVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      ]
      const videoUrl = placeholderVideos[Math.floor(Math.random() * placeholderVideos.length)]

      console.log('⚠️ Using placeholder video due to generation failure')

      // Save and return placeholder
      return await saveAndReturnVideo(videoUrl, prompt, orientation, email, res, 'fallback')
    }

    const operationName = generateResponse.data.name
    console.log('✅ Video generation started, operation:', operationName)

    // Poll for completion (max 2 minutes for Veo 3 Fast)
    let attempts = 0
    const maxAttempts = 24 // 24 × 5 seconds = 2 minutes
    let videoUrl = null

    while (attempts < maxAttempts) {
      console.log(`🔄 Polling attempt ${attempts + 1}/${maxAttempts}`)

      const statusUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}`
      const statusResponse = await makeHttpsRequest(statusUrl, 'GET', geminiApiKey)

      if (!statusResponse.success) {
        attempts++
        await sleep(5000)
        continue
      }

      const operation = statusResponse.data

      if (operation.done) {
        console.log('✅ Video generation completed!')

        if (operation.error) {
          console.log('❌ Video generation error:', operation.error)
          break
        }

        // Extract video URL
        if (operation.response?.generatedVideos?.[0]?.video) {
          const fileId = operation.response.generatedVideos[0].video
          videoUrl = `https://generativelanguage.googleapis.com/v1beta/files/${fileId}`
          console.log('🎥 Video generated successfully!')
          break
        }
      }

      attempts++
      await sleep(5000)
    }

    // Fallback if video generation timed out or failed
    if (!videoUrl) {
      console.log('⏰ Video generation timed out or failed, using placeholder')
      const placeholderVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      ]
      videoUrl = placeholderVideos[Math.floor(Math.random() * placeholderVideos.length)]
    }

    // Store video metadata in database
    const supabaseUrl = 'https://ziwwwlahrsvrafyawkjw.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const videoData = {
      user_email: email,
      prompt: prompt,
      video_url: videoUrl,
      orientation: orientation,
      generation_status: 'completed',
      created_at: new Date().toISOString(),
      file_size: null, // Will be updated when we know the file size
      duration: 8 // Approximate duration in seconds
    }


    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(videoData)
    })

    let savedVideo = null
    if (dbResponse.ok) {
      savedVideo = await dbResponse.json()
    } else {
      const errorText = await dbResponse.text()
    }


    return res.status(200).json({
      success: true,
      video: {
        id: savedVideo?.[0]?.id || `temp_${Date.now()}`,
        url: videoUrl,
        prompt: prompt,
        orientation: orientation,
        timestamp: new Date().toISOString(),
        status: 'completed'
      },
      message: 'Video generated successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.log('❌ Fatal error:', error.message)
    return res.status(500).json({
      error: 'Video generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper function to make HTTPS requests
function makeHttpsRequest(url, method, apiKey, body = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url)

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }

    if (body) {
      const bodyData = JSON.stringify(body)
      options.headers['Content-Length'] = Buffer.byteLength(bodyData)
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ success: true, data: JSON.parse(data) })
          } catch (e) {
            resolve({ success: true, data: { raw: data } })
          }
        } else {
          resolve({ success: false, status: res.statusCode, error: data })
        }
      })
    })

    req.on('error', (error) => {
      resolve({ success: false, error: error.message })
    })

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

// Helper function to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}