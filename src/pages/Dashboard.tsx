import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Zap,
  Send,
  Loader2,
  ChevronDown,
  CreditCard,
  Crown,
  Sparkles,
  LogOut,
  X,
  Menu,
  Settings,
  History,
  BarChart3
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/videos'
import { paddleClient } from '@/lib/paddleClient'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { generatedVideos, addVideo, removeVideo, clearAllVideos } = useVideoStore()
  const [prompt, setPrompt] = useState('')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [attemptedGenerationWithNoTokens, setAttemptedGenerationWithNoTokens] = useState(false)

  // Token system - use correct database fields
  const getTokenInfo = () => {
    const userPlan = user?.subscription_tier || 'free'
    const credits = user?.usage_stats?.credits_remaining || user?.video_credits || 0

    switch (userPlan) {
      case 'free':
        return { remaining: credits, planName: 'No Plan - Buy Tokens' }
      case 'basic':
        return { remaining: credits, planName: 'Basic Monthly Plan' }
      case 'premium':
        return { remaining: credits, planName: 'Premium Monthly Plan' }
      default:
        return { remaining: credits, planName: 'No Plan - Buy Tokens' }
    }
  }

  const tokenInfo = getTokenInfo()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleGenerate = async () => {
    console.log('=== 🎬 VIDEO GENERATION STARTED ===')
    console.log('📝 Prompt:', prompt.trim())
    console.log('👤 User ID:', user?.id)
    console.log('📧 User Email:', user?.email)
    console.log('📊 Credits before generation:', tokenInfo.remaining)
    console.log('🎯 Current tier:', user?.subscription_tier)

    if (!prompt.trim()) {
      console.log('❌ Generation cancelled: Empty prompt')
      return
    }

    // Check if user has credits
    if (tokenInfo.remaining <= 0) {
      console.log('❌ Generation cancelled: No credits remaining')
      setAttemptedGenerationWithNoTokens(true)
      setShowPricingModal(true)
      return
    }

    setIsGenerating(true)
    console.log('🔄 Setting generation state to true')

    try {
      console.log('⏳ Starting video generation simulation (5 seconds)...')

      // Simulate video generation (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000))

      console.log('✅ Video generation completed!')
      console.log('🎥 Generated video for prompt:', prompt.trim())

      // Simulate a generated video (for now, use different placeholder videos)
      const videoSamples = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
      ]

      const randomVideoUrl = videoSamples[generatedVideos.length % videoSamples.length]

      console.log('🎬 Adding new video to store:', {
        url: randomVideoUrl,
        prompt: prompt.trim()
      })
      console.log('📊 Total videos after this generation:', generatedVideos.length + 1)

      // Add video using the store
      addVideo({
        url: randomVideoUrl,
        prompt: prompt.trim()
      })

      console.log('💾 Video now added to dashboard collection')
      console.log('📹 Videos in collection:', generatedVideos.length + 1)

      // CRITICAL: Deduct 1 credit from user's balance
      console.log('💳 Deducting 1 credit from user balance...')
      try {
        const response = await fetch('/api/deduct-credit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: user?.email,
            videoPrompt: prompt.trim()
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Credit deducted successfully:', result)
          console.log('📊 New credit balance:', result.newBalance)

          // Refresh user data to show updated credits
          const { refreshUserData } = useAuthStore.getState()
          refreshUserData()
        } else {
          console.error('❌ Failed to deduct credit:', response.status)
          throw new Error('Credit deduction failed')
        }
      } catch (error) {
        console.error('💥 Credit deduction error:', error)
        // TODO: Handle credit deduction failure (maybe refund the video?)
      }

      // Don't navigate away - stay on dashboard to show the video
      // navigate('/videos') // REMOVED: Don't redirect

    } catch (error) {
      console.error('💥 Generation failed:', error)
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack
      })
    } finally {
      setIsGenerating(false)
      console.log('✅ Generation process completed, setting loading state to false')

      // Clear the prompt after generation
      setPrompt('')
      console.log('🧹 Prompt cleared')

      console.log('=== 🎬 VIDEO GENERATION FINISHED ===')
    }
  }

  const tiers = [
    {
      name: 'Pay-per-Video',
      tokens: 1,
      price: '$2.99',
      description: 'Generate one video',
      icon: CreditCard,
      priceId: import.meta.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID,
      subscriptionTier: 'pay_per_video'
    },
    {
      name: 'Basic Monthly',
      tokens: 20,
      price: '$19.99',
      description: '20 videos per month',
      icon: Sparkles,
      priceId: import.meta.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID,
      subscriptionTier: 'basic'
    },
    {
      name: 'Premium Monthly',
      tokens: 120,
      price: '$49.99',
      description: '120 videos per month',
      icon: Crown,
      priceId: import.meta.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID,
      subscriptionTier: 'premium'
    }
  ]

  const handlePurchase = async (tier: typeof tiers[0]) => {
    try {
      console.log(`Purchasing ${tier.name} for user ${user?.id}`)

      // Open Paddle checkout
      await paddleClient.openCheckout(tier.priceId, user?.paddle_customer_id)

      // Close the modal after opening checkout
      setShowPricingModal(false)

      // Note: The webhook will handle updating user tokens after successful payment
    } catch (error) {
      console.error('Purchase failed:', error)
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Liquid Background - Fixed Position */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Base gradient layer */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 122, 255, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(175, 82, 222, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 40% 80%, rgba(255, 45, 146, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 60% 30%, rgba(255, 149, 0, 0.25) 0%, transparent 60%),
              linear-gradient(145deg, #000000 0%, #050505 25%, #0f0f0f 50%, #050505 75%, #000000 100%),
              radial-gradient(ellipse at top left, rgba(0, 0, 0, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.5) 0%, transparent 50%)
            `,
            animation: 'liquidFlow 8.3s ease-in-out infinite'
          }}
        />

        {/* Animated flowing layer */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 10% 60%, rgba(34, 197, 94, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse at 90% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse at 50% 10%, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse at 30% 90%, rgba(239, 68, 68, 0.15) 0%, transparent 70%)
            `,
            animation: 'liquidFlow 6.7s ease-in-out infinite reverse'
          }}
        />

        {/* Subtle overlay layer */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 70% 70%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 30% 30%, rgba(244, 63, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(99, 102, 241, 0.05) 45deg, transparent 90deg, rgba(168, 85, 247, 0.05) 135deg, transparent 180deg, rgba(236, 72, 153, 0.05) 225deg, transparent 270deg, rgba(59, 130, 246, 0.05) 315deg, transparent 360deg)
            `,
            animation: 'liquidFlow 10s linear infinite'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <Video className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-medium text-white" style={{ fontFamily: 'Google Sans, sans-serif' }}>
                Kateriss
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Token Counter */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {tokenInfo.remaining} tokens
                </span>
              </div>

              {/* Subscription Tier */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full border border-white/20">
                <Crown className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white capitalize">
                  {user?.subscription_tier || 'free'} plan
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-20 left-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-50">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigate('/templates')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Templates</span>
              </button>
              <button
                onClick={() => {
                  navigate('/videos')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  navigate('/analytics')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setShowMobileMenu(false)
                }}
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex flex-col h-[calc(100vh-100px)]">
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 px-4"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Create AI Video
              </h1>
              <p className="text-white/70 text-lg">
                Describe your idea and generate stunning videos
              </p>
            </motion.div>

            {/* Spacer to push content to bottom */}
            <div className="flex-1"></div>

            {/* Bottom Controls Container */}
            <div className="w-full px-4 pb-0">
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
                    className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/15 transition-all"
                  >
                    <span className="text-lg">
                      {orientation === 'horizontal' ? '🖥️ Horizontal (16:9)' : '📱 Vertical (9:16)'}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-10">
                      <button
                        onClick={() => {
                          setOrientation('horizontal')
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 p-4 text-white hover:bg-white/10 transition-all"
                      >
                        <div className="w-8 h-5 bg-white/20 rounded-sm"></div>
                        <span>Horizontal (16:9)</span>
                      </button>
                      <button
                        onClick={() => {
                          setOrientation('vertical')
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-3 p-4 text-white hover:bg-white/10 transition-all"
                      >
                        <div className="w-5 h-8 bg-white/20 rounded-sm"></div>
                        <span>Vertical (9:16)</span>
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* Generated Videos Display */}
                {generatedVideos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mb-6"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">
                          Generated Videos ({generatedVideos.length})
                        </h3>
                        <button
                          onClick={() => {
                            console.log('🗑️ Clearing all generated videos from display')
                            clearAllVideos()
                          }}
                          className="text-white/60 hover:text-white/80 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {generatedVideos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                  Video {generatedVideos.length - index}
                                </span>
                                <span className="text-white/40 text-xs">
                                  {new Date(video.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  console.log('🗑️ Removing video:', video.id)
                                  removeVideo(video.id)
                                }}
                                className="text-white/40 hover:text-white/70 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="relative rounded-lg overflow-hidden bg-black/20 mb-3">
                              <video
                                src={video.url}
                                controls
                                className="w-full max-h-64 object-cover"
                                autoPlay={false}
                              />
                            </div>

                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-white/60 text-sm mb-1">Prompt:</p>
                              <p className="text-white text-sm">{video.prompt}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Input Area at Bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mb-0"
                >
                  <div className="flex items-end gap-3 p-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your video idea..."
                      className="flex-1 p-3 bg-transparent text-white placeholder-white/50 resize-none focus:outline-none text-lg"
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
                      disabled={!prompt.trim() || isGenerating}
                      className={`p-3 rounded-lg transition-all ${
                        (!prompt.trim() || isGenerating)
                          ? 'bg-white/10 text-white/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {attemptedGenerationWithNoTokens && tokenInfo.remaining <= 0 && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-red-400 text-sm">
                          You have 0 tokens. Purchase tokens to generate videos.
                        </p>
                        <motion.button
                          onClick={() => setShowPricingModal(true)}
                          className="relative overflow-hidden group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-xs px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)"
                          }}
                          whileTap={{ scale: 0.95 }}
                          animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                          }}
                          transition={{
                            backgroundPosition: {
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                            }
                          }}
                          style={{
                            backgroundSize: "200% 200%"
                          }}
                        >
                          <span className="relative z-10 flex items-center gap-1">
                            <motion.span
                              animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                              }}
                            >
                              ⚡
                            </motion.span>
                            Buy Tokens
                          </span>

                          {/* Animated background particles */}
                          <div className="absolute inset-0 opacity-30">
                            <motion.div
                              className="absolute w-1 h-1 bg-white rounded-full"
                              animate={{
                                x: [0, 40, 0],
                                y: [0, -20, 0],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: 0
                              }}
                              style={{ left: "10%", top: "20%" }}
                            />
                            <motion.div
                              className="absolute w-1 h-1 bg-white rounded-full"
                              animate={{
                                x: [0, -30, 0],
                                y: [0, -15, 0],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: 0.5
                              }}
                              style={{ right: "15%", top: "60%" }}
                            />
                            <motion.div
                              className="absolute w-1 h-1 bg-white rounded-full"
                              animate={{
                                x: [0, 20, 0],
                                y: [0, 15, 0],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay: 1
                              }}
                              style={{ left: "60%", top: "10%" }}
                            />
                          </div>

                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </>
        </main>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
              <button
                onClick={() => setShowPricingModal(false)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/70 mb-6">
              You have 0 tokens. Select a plan to start generating videos.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {tiers.map((tier) => (
                <motion.div
                  key={tier.name}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => handlePurchase(tier)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <tier.icon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{tier.price}</p>
                  <p className="text-white/70 text-sm mb-3">{tier.description}</p>
                  <p className="text-yellow-400 text-sm font-medium">{tier.tokens} tokens</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes liquidFlow {
          0%, 100% {
            filter: hue-rotate(0deg) blur(0px);
            transform: scale(1) rotate(0deg);
          }
          25% {
            filter: hue-rotate(90deg) blur(1px);
            transform: scale(1.02) rotate(0.5deg);
          }
          50% {
            filter: hue-rotate(180deg) blur(2px);
            transform: scale(1.05) rotate(1deg);
          }
          75% {
            filter: hue-rotate(270deg) blur(1px);
            transform: scale(1.02) rotate(0.5deg);
          }
        }
      `}</style>
    </div>
  )
}