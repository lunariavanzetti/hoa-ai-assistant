import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Video, Sparkles, Download, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'
import { paddleClient } from '@/lib/paddleClient'

export const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { signInWithProvider } = useAuthStore()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoError, setVideoError] = useState(false)

  const videos = [
    '/videos/1.mov',
    '/videos/2.mov',
    '/videos/3.mov'
  ]

  // Initialize Paddle.js
  useEffect(() => {
    const initializePaddle = async () => {
      try {
        await paddleClient.initialize()
        console.log('✅ Paddle.js initialized')
      } catch (error) {
        console.error('❌ Failed to initialize Paddle.js:', error)
      }
    }

    initializePaddle()
  }, [])

  // Handle video cycling
  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
  }

  const handleVideoError = () => {
    console.warn(`Failed to load video: ${videos[currentVideoIndex]}`)
    const nextIndex = (currentVideoIndex + 1) % videos.length
    if (nextIndex !== 0) {
      setCurrentVideoIndex(nextIndex)
    } else {
      setVideoError(true)
    }
  }

  // Preload next video for smoother transitions
  useEffect(() => {
    const nextVideoIndex = (currentVideoIndex + 1) % videos.length
    const nextVideo = document.createElement('video')
    nextVideo.preload = 'metadata'
    nextVideo.src = videos[nextVideoIndex]
  }, [currentVideoIndex, videos])

  const handleGetStarted = () => {
    navigate('/auth')
  }

  const handleSignIn = async () => {
    try {
      await signInWithProvider('google')
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black/90">
      {/* Background Video Container */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            preload="metadata"
            style={{
              minWidth: '100%',
              minHeight: '100%',
            }}
          >
            <source src={videos[currentVideoIndex]} type="video/quicktime" />
            <source src={videos[currentVideoIndex]} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        )}

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between max-w-7xl mx-auto"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
              <span className="text-lg sm:text-xl font-medium text-white" style={{ fontFamily: 'Google Sans, sans-serif' }}>
                Kateriss
              </span>
            </div>

            <button
              onClick={handleSignIn}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
              style={{ fontFamily: 'Google Sans, sans-serif' }}
            >
              Sign in
            </button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="px-4 sm:px-6 py-8 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 sm:mb-16"
            >
              <h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-4 sm:mb-6 leading-tight"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                Create videos with
                <br className="hidden sm:block" />
                <span className="font-medium">AI magic</span>
              </h1>

              <p
                className="text-base sm:text-lg md:text-xl text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                Turn your ideas into stunning videos in minutes. No experience needed.
              </p>

              <motion.button
                onClick={handleGetStarted}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/90 backdrop-blur-[2px] text-black text-base sm:text-lg font-medium rounded-full hover:bg-white transition-all duration-200 flex items-center gap-2 sm:gap-3 mx-auto"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start creating
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-20"
            >
              {/* Feature 1 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-medium text-white mb-2 sm:mb-3"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      Type your idea
                    </h3>
                    <p
                      className="text-sm sm:text-base text-white/60 leading-relaxed"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      Describe what you want in simple words. Our AI understands your vision.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-medium text-white mb-2 sm:mb-3"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      AI creates
                    </h3>
                    <p
                      className="text-sm sm:text-base text-white/60 leading-relaxed"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      Watch as advanced AI brings your vision to life with stunning visuals.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group sm:col-span-2 lg:col-span-1">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 sm:p-8 hover:bg-white/10 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                      <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                    </div>
                    <h3
                      className="text-lg sm:text-xl font-medium text-white mb-2 sm:mb-3"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      Share anywhere
                    </h3>
                    <p
                      className="text-sm sm:text-base text-white/60 leading-relaxed"
                      style={{ fontFamily: 'Google Sans, sans-serif' }}
                    >
                      Download in high quality and share your masterpiece across all platforms.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <Users className="w-4 h-4 text-white/60" />
                <span
                  className="text-sm text-white/60"
                  style={{ fontFamily: 'Google Sans, sans-serif' }}
                >
                  Join 10,000+ creators making videos with AI
                </span>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
              <p
                className="text-xs text-white/40"
                style={{ fontFamily: 'Google Sans, sans-serif' }}
              >
                Powered by advanced AI • Built for creators
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}