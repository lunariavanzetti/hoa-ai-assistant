import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Video } from 'lucide-react'
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
    // Try next video instead of showing error immediately
    const nextIndex = (currentVideoIndex + 1) % videos.length
    if (nextIndex !== 0) {
      // If we're not back to the first video, try the next one
      setCurrentVideoIndex(nextIndex)
    } else {
      // If we've tried all videos, show fallback
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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Video Container */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            key={currentVideoIndex} // Force re-render when video changes
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
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
          // Fallback gradient background when videos fail to load
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black"></div>
        )}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Animated particles overlay */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Simple Header */}
        <header className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between max-w-7xl mx-auto"
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Kateriss</span>
            </div>

            {/* Simple Sign In */}
            <button
              onClick={handleSignIn}
              className="px-6 py-2 text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </button>
          </motion.div>
        </header>

        {/* Hero Section - Centered */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Create videos with
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI magic
                </span>
              </h1>

              {/* Simple Description */}
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Turn your ideas into stunning videos in minutes. No experience needed.
              </p>

              {/* Two Simple Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-white text-black text-lg font-semibold rounded-full hover:bg-white/90 transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start creating
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={() => {
                    // Scroll to demo section or play demo video
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-4 border border-white/30 text-white text-lg font-semibold rounded-full hover:bg-white/10 transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch demo
                </motion.button>
              </div>

              {/* Simple Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-white/60"
              >
                <p className="text-sm">
                  Join 10,000+ creators making videos with AI
                </p>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Demo Section */}
        <section id="demo" className="pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Demo Video Placeholder */}
              <div className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 max-w-4xl mx-auto">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white/60 mx-auto mb-4" />
                    <p className="text-white/80">
                      Watch how AI creates your video
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Feature List */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Type your idea</h3>
                  <p className="text-white/60 text-sm">Describe what you want in simple words</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">AI creates</h3>
                  <p className="text-white/60 text-sm">Watch as your video comes to life</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Share anywhere</h3>
                  <p className="text-white/60 text-sm">Download and share your masterpiece</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}