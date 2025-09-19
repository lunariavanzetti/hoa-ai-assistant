import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Download,
  Zap,
  Loader2,
  CheckCircle,
  Video as VideoIcon,
  Send,
  ChevronDown
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export const VideoGenerator: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // Get initial values from dashboard if passed
  const initialPrompt = location.state?.prompt || ''
  const initialOrientation = location.state?.orientation || 'horizontal'

  const [prompt, setPrompt] = useState(initialPrompt)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(initialOrientation)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [originalPrompt, setOriginalPrompt] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Token system - use actual tokens from user
  const getTokenInfo = () => {
    const userPlan = user?.subscription_tier || 'free'
    const tokens = user?.tokens || 0

    switch (userPlan) {
      case 'free':
        return { remaining: tokens, planName: 'No Plan - Buy Tokens' }
      case 'basic':
        return { remaining: tokens, planName: 'Basic Monthly Plan' }
      case 'premium':
        return { remaining: tokens, planName: 'Premium Monthly Plan' }
      default:
        return { remaining: tokens, planName: 'No Plan - Buy Tokens' }
    }
  }

  const tokenInfo = getTokenInfo()

  const handleGenerate = async () => {
    if (!prompt.trim() || tokenInfo.remaining <= 0) return

    setIsGenerating(true)
    setOriginalPrompt(prompt)

    try {
      // Simulate video generation (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock generated video - in real app, this would be the actual generated video URL
      const mockVideoUrl = orientation === 'vertical' ? '/videos/1.mov' : '/videos/2.mov'
      setGeneratedVideo(mockVideoUrl)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedVideo) {
      // Create download link
      const link = document.createElement('a')
      link.href = generatedVideo
      link.download = `generated-video-${Date.now()}.mov`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleNewVideo = () => {
    setGeneratedVideo(null)
    setPrompt('')
    setOriginalPrompt('')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Liquid Background */}
      <div
        className="fixed inset-0 z-[-1] opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 122, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(175, 82, 222, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 45, 146, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 60% 30%, rgba(255, 149, 0, 0.15) 0%, transparent 50%),
            linear-gradient(145deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #000000 100%)
          `,
          animation: 'liquidFlow 20s ease-in-out infinite'
        }}
      />

      <div className="relative z-10">
        {/* Compact Header */}
        <header className="p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Back</span>
            </button>

            {/* Token Counter */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full border border-white/20">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-medium text-white">
                {tokenInfo.remaining}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-col h-[calc(100vh-80px)]">
          {!generatedVideo ? (
            /* Compact Generation Interface */
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 px-3 pt-4"
              >
                <h1 className="text-xl font-bold text-white mb-1">
                  Create AI Video
                </h1>
                <p className="text-white/70 text-sm">
                  Describe your idea and select format
                </p>
              </motion.div>

              {/* Spacer to push content to bottom */}
              <div className="flex-1"></div>

              {/* Bottom Controls Container */}
              <div className="w-full px-3 pb-0">
                <div className="w-full md:w-3/4 mx-auto">
                  {/* Orientation Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 relative"
                  >
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm hover:bg-white/15 transition-all"
                    >
                      <span>
                        {orientation === 'horizontal' ? '🖥️ Horizontal (16:9)' : '📱 Vertical (9:16)'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-10">
                        <button
                          onClick={() => {
                            setOrientation('horizontal')
                            setShowDropdown(false)
                          }}
                          className="w-full flex items-center gap-2 p-3 text-white text-sm hover:bg-white/10 transition-all"
                        >
                          <div className="w-6 h-4 bg-white/20 rounded-sm"></div>
                          <span>Horizontal (16:9)</span>
                        </button>
                        <button
                          onClick={() => {
                            setOrientation('vertical')
                            setShowDropdown(false)
                          }}
                          className="w-full flex items-center gap-2 p-3 text-white text-sm hover:bg-white/10 transition-all"
                        >
                          <div className="w-4 h-6 bg-white/20 rounded-sm"></div>
                          <span>Vertical (9:16)</span>
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Input Area at Bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mb-0"
                  >
                    <div className="flex items-end gap-2 p-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your video idea..."
                        className="flex-1 p-2 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none text-sm"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleGenerate()
                          }
                        }}
                      />

                      <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || tokenInfo.remaining <= 0 || isGenerating}
                        className={`p-2 rounded-lg transition-all ${
                          (!prompt.trim() || tokenInfo.remaining <= 0 || isGenerating)
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {tokenInfo.remaining <= 0 && (
                      <div className="px-3 pb-3">
                        <p className="text-red-400 text-xs">
                          You have 0 tokens. Purchase tokens to generate videos.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            /* Compact Video Result Display */
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-3"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h1 className="text-lg font-bold text-white">
                    Video Ready!
                  </h1>
                </div>
              </motion.div>

              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl mb-3 ${
                  orientation === 'vertical' ? 'max-w-xs mx-auto' : ''
                }`}
              >
                <div className={`relative bg-black rounded-lg overflow-hidden ${
                  orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
                }`}>
                  <video
                    controls
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                  >
                    <source src={generatedVideo} type="video/quicktime" />
                    <source src={generatedVideo} type="video/mp4" />
                  </video>
                </div>
              </motion.div>

              {/* Prompt Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl mb-3"
              >
                <h3 className="text-white font-medium text-sm mb-1">Prompt</h3>
                <p className="text-white/70 text-xs italic">"{originalPrompt}"</p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2"
              >
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <button
                  onClick={handleNewVideo}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium text-sm hover:bg-white/20 transition-all"
                >
                  <VideoIcon className="w-4 h-4" />
                  New Video
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% {
            filter: hue-rotate(0deg) blur(0px);
          }
          33% {
            filter: hue-rotate(120deg) blur(2px);
          }
          66% {
            filter: hue-rotate(240deg) blur(1px);
          }
        }
      `}</style>
    </div>
  )
}