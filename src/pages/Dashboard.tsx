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
import { paddleClient } from '@/lib/paddleClient'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [prompt, setPrompt] = useState('')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Token system - starts with 0 tokens after signup
  const getTokenInfo = () => {
    const userPlan = user?.subscription_tier || 'free'
    const tokens = user?.tokens || 0 // Start with 0 tokens

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

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    // Check if user has tokens
    if (tokenInfo.remaining <= 0) {
      setShowPricingModal(true)
      return
    }

    setIsGenerating(true)
    try {
      // Simulate video generation (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000))

      // After generation, navigate to video history to see the result
      navigate('/videos')
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
      // Clear the prompt after generation
      setPrompt('')
    }
  }

  const tiers = [
    {
      name: 'Pay-per-Video',
      tokens: 1,
      price: '$2.99',
      description: 'Generate one video',
      icon: CreditCard,
      priceId: 'pri_01k57nwm63j9t40q3pfj73dcw8', // Pay-per-Video
      subscriptionTier: 'pay_per_video'
    },
    {
      name: 'Basic Monthly',
      tokens: 20,
      price: '$19.99',
      description: '20 videos per month',
      icon: Sparkles,
      priceId: 'pri_01k57p3ca33wrf9vs80qsvjzj8', // Basic Monthly
      subscriptionTier: 'basic'
    },
    {
      name: 'Premium Monthly',
      tokens: 120,
      price: '$49.99',
      description: '120 videos per month',
      icon: Crown,
      priceId: 'pri_01k57pcdf2ej7gc5p7taj77e0q', // Premium Monthly
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

                  {tokenInfo.remaining <= 0 && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-red-400 text-sm">
                          You have 0 tokens. Purchase tokens to generate videos.
                        </p>
                        <button
                          onClick={() => setShowPricingModal(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                        >
                          Buy Tokens
                        </button>
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