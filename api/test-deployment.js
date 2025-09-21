// Test API to verify deployment
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    success: true,
    message: 'New API deployment working',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.VITE_GEMINI_API_KEY
  })
}