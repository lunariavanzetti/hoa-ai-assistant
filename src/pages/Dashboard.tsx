import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageToggle } from '@/components/LanguageToggle'
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
  BarChart3,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useVideoStore } from '@/stores/videos'
import { paddleClient } from '@/lib/paddleClient'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut, refreshUserData } = useAuthStore()
  const { generatedVideos, addVideo, removeVideo, clearAllVideos, fetchUserVideos } = useVideoStore()
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [attemptedGenerationWithNoTokens, setAttemptedGenerationWithNoTokens] = useState(false)

  // Fetch user videos on mount
  useEffect(() => {
    console.log('📺 Dashboard mounted, user email:', user?.email)
    if (user?.email) {
      console.log('🎬 Calling fetchUserVideos for:', user.email)
      fetchUserVideos(user.email)
    } else {
      console.log('⚠️ No user email, skipping video fetch')
    }
  }, [user?.email, fetchUserVideos])

  // Refresh token count on mount and every 4 seconds
  useEffect(() => {
    // Refresh immediately on mount
    refreshUserData()

    // Set up interval to refresh every 4 seconds
    const interval = setInterval(() => {
      refreshUserData()
    }, 4000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [refreshUserData])

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

  const handleDownloadVideo = async (videoUrl: string, videoId: string) => {
    try {
      // Fetch the video blob
      const response = await fetch(videoUrl)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kateriss-video-${videoId}.mp4`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading video:', error)
      alert('Failed to download video. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🔘 LOGOUT BUTTON CLICKED')
      await signOut()
      console.log('🏠 NAVIGATING TO HOME PAGE')
      navigate('/')
    } catch (error) {
      console.log('❌ HANDLE LOGOUT ERROR:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      console.log('⚠️ SEND BUTTON PRESSED - Empty prompt, ignoring')
      return
    }

    console.log('📝 SEND BUTTON PRESSED:', {
      email: user?.email,
      prompt: prompt.trim().substring(0, 50) + '...',
      orientation,
      current_tokens: tokenInfo.remaining
    })

    // Check if user has credits
    if (tokenInfo.remaining <= 0) {
      console.log('🚫 NO TOKENS - OPENING PAYWALL:', {
        email: user?.email,
        tokens: tokenInfo.remaining
      })
      setAttemptedGenerationWithNoTokens(true)
      setShowPricingModal(true)
      return
    }

    setIsGenerating(true)

    // Log video generation attempt
    console.log('🎬 STARTING VIDEO GENERATION:', {
      email: user?.email,
      prompt: prompt.trim(),
      orientation: orientation,
      tokens_before: tokenInfo.remaining
    })

    try {
      // Call server-side video generation API (Veo 3 Fast)
      console.log('🎥 Calling video generation API...')

      const videoResponse = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          orientation: orientation,
          email: user?.email
        })
      })

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json().catch(() => ({}))
        console.error('❌ Video generation API error:', {
          status: videoResponse.status,
          error: errorData
        })

        alert('❌ Video generation failed. Please try again later.')
        return
      }

      const videoData = await videoResponse.json()
      console.log('✅ Video generated successfully!')

      // Add video to store
      addVideo({
        id: videoData.video?.id || `video_${Date.now()}`,
        url: videoData.video?.url,
        prompt: prompt.trim(),
        orientation: orientation,
        timestamp: new Date().toISOString()
      })

      // Deduct 1 credit from user's balance
      try {
        console.log('💸 DEDUCTING TOKEN:', {
          email: user?.email,
          tokens_before: tokenInfo.remaining,
          tokens_to_deduct: 1
        })

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
          console.log('✅ TOKEN DEDUCTED SUCCESSFULLY')
          const { refreshUserData } = useAuthStore.getState()
          await refreshUserData()
          console.log('🔄 USER DATA REFRESHED')
        } else {
          console.log('❌ TOKEN DEDUCTION FAILED:', response.status)
        }
      } catch (error) {
        console.log('❌ TOKEN DEDUCTION ERROR:', error)
      }

    } catch (error) {
      // Handle errors silently
    } finally {
      setIsGenerating(false)
      setPrompt('')
    }
  }

  const tiers = [
    {
      name: 'Basic Pack',
      tokens: 10,
      price: '$19.99',
      description: '10 videos',
      icon: Sparkles,
      priceId: import.meta.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID,
      subscriptionTier: 'basic'
    },
    {
      name: 'Premium Pack',
      tokens: 100,
      price: '$149.99',
      description: '100 videos',
      icon: Crown,
      priceId: import.meta.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID,
      subscriptionTier: 'premium'
    }
  ]

  const handlePurchase = async (tier: typeof tiers[0]) => {
    try {
      console.log('💳 OPENING PADDLE CHECKOUT:', {
        email: user?.email,
        tier: tier.name,
        price: tier.price,
        tokens_to_add: tier.tokens,
        current_tokens: tokenInfo.remaining
      })
      await paddleClient.openCheckout(tier.priceId, user?.paddle_customer_id)
      console.log('✅ PADDLE CHECKOUT OPENED SUCCESSFULLY')
      console.log('❌ CLOSING PAYWALL MODAL')
      setShowPricingModal(false)
    } catch (error) {
      console.log('❌ PADDLE CHECKOUT FAILED:', error)
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
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <span className="text-xs sm:text-sm font-medium text-white">
                  {tokenInfo.remaining} {t('header.tokens')}
                </span>
              </button>

              {/* Subscription Tier */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full border border-white/20">
                <Crown className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white capitalize">
                  {user?.subscription_tier || 'free'} {t('header.plan')}
                </span>
              </div>

              {/* Language Toggle */}
              <LanguageToggle />

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
          <div className="absolute top-16 left-2 right-2 sm:left-4 sm:right-auto sm:w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-50">
            <div className="flex flex-col gap-3">
              {/* Mobile Subscription Tier */}
              <button
                onClick={() => {
                  setShowPricingModal(true)
                  setShowMobileMenu(false)
                }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 mb-2 hover:bg-white/10 transition-all cursor-pointer w-full"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white capitalize">
                    {user?.subscription_tier || 'free'} plan
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  {tokenInfo.remaining} tokens
                </div>
              </button>
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
              <div className="border-t border-white/10 my-2"></div>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Scrollable Area */}
        <main className="flex flex-col min-h-[calc(100vh-100px)] pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 px-4"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {t('dashboard.title')}
            </h1>
            <p className="text-white/70 text-sm sm:text-base">
              {t('dashboard.subtitle')}
            </p>
          </motion.div>

          {/* Generated Videos Display */}
          {generatedVideos.length > 0 && (
            <div className="w-full px-2 sm:px-4">
              <div className="w-full lg:w-3/4 mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl mb-6"
                >
                  <div className="p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Videos ({generatedVideos.length})
                      </h3>
                      <button
                        onClick={() => {
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
                          className="bg-white/5 rounded-lg p-2 sm:p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                Video {generatedVideos.length - index}
                              </span>
                              <span className="text-white/40 text-xs">
                                {new Date(video.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadVideo(video.url, video.id)}
                                className="text-white/40 hover:text-green-400 transition-colors p-1.5 hover:bg-green-500/10 rounded"
                                title="Download video"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  removeVideo(video.id)
                                }}
                                className="text-white/40 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded"
                                title="Delete video"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="relative rounded-lg overflow-hidden bg-black/20 mb-3">
                            <video
                              src={video.url}
                              controls
                              className="w-full h-48 sm:h-64 object-cover"
                              autoPlay={false}
                            />
                          </div>

                          <div className="bg-white/5 rounded-lg p-2 sm:p-3">
                            <p className="text-white/60 text-xs sm:text-sm mb-1">Prompt:</p>
                            <p className="text-white text-xs sm:text-sm break-words">{video.prompt}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Bottom Input Area - Mobile Optimized */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="w-full px-3 py-3">
            <div className="w-full max-w-4xl mx-auto space-y-2">
              {/* Token Warning - Show at top on mobile */}
              {attemptedGenerationWithNoTokens && tokenInfo.remaining <= 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-xs sm:text-sm">
                    {t('dashboard.noTokens')}
                  </p>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-medium hover:shadow-lg transition-all whitespace-nowrap"
                  >
                    {t('dashboard.buyTokens')}
                  </button>
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-2">
                {/* Orientation Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1 px-2 py-2 text-white/70 hover:text-white transition-all text-sm bg-white/10 rounded-lg"
                  >
                    <span>{orientation === 'horizontal' ? '🖥️' : '📱'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setOrientation('horizontal')
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 transition-all text-sm"
                      >
                        <span>🖥️</span>
                        <span>16:9</span>
                      </button>
                      <button
                        onClick={() => {
                          setOrientation('vertical')
                          setShowDropdown(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 transition-all text-sm"
                      >
                        <span>📱</span>
                        <span>9:16</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('dashboard.placeholder')}
                  className="flex-1 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleGenerate()
                    }
                  }}
                />

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    (!prompt.trim() || isGenerating)
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
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
                onClick={() => {
                  console.log('❌ USER CLOSED PAYWALL MODAL')
                  setShowPricingModal(false)
                }}
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