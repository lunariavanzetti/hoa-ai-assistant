import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Zap,
  CreditCard,
  Crown,
  Sparkles,
  ArrowLeft,
  LogOut,
  Check
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'

export const Pricing: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const tiers = [
    {
      name: 'Pay-per-Video',
      tokens: 1,
      price: '$2.99',
      description: 'Perfect for trying out AI video generation',
      features: ['1 video generation', 'HD quality output', 'Horizontal & vertical formats'],
      icon: CreditCard,
      priceId: import.meta.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID,
      subscriptionTier: 'pay_per_video',
      popular: false
    },
    {
      name: 'Basic Monthly',
      tokens: 20,
      price: '$19.99',
      description: 'Great for regular content creators',
      features: ['20 video generations per month', 'HD quality output', 'Horizontal & vertical formats', 'Priority processing'],
      icon: Sparkles,
      priceId: import.meta.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID,
      subscriptionTier: 'basic',
      popular: true
    },
    {
      name: 'Premium Monthly',
      tokens: 120,
      price: '$49.99',
      description: 'For professional video creators',
      features: ['120 video generations per month', 'HD quality output', 'Horizontal & vertical formats', 'Priority processing', 'Early access to new features'],
      icon: Crown,
      priceId: import.meta.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID,
      subscriptionTier: 'premium',
      popular: false
    }
  ]

  const handlePurchase = async (tier: typeof tiers[0]) => {
    try {
      setIsLoading(tier.priceId)
      console.log(`Purchasing ${tier.name} for user ${user?.id}`)

      // Open Paddle checkout
      await paddleClient.openCheckout(tier.priceId, user?.paddle_customer_id, user?.email)

    } catch (error) {
      console.error('Purchase failed:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(null)
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
              <button
                onClick={() => navigate('/')}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
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
                  {user?.tokens || 0} tokens
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

        {/* Main Content */}
        <main className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Choose Your Plan
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Select the perfect plan for your AI video generation needs. All plans include HD quality output and both horizontal and vertical formats.
              </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white/5 border rounded-2xl p-6 ${
                    tier.popular ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <tier.icon className="w-8 h-8 text-white" />
                    <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    {tier.name !== 'Pay-per-Video' && (
                      <span className="text-white/60 text-sm">/month</span>
                    )}
                  </div>

                  <p className="text-white/70 text-sm mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <p className="text-yellow-400 font-medium mb-2">
                      {tier.tokens} video generation{tier.tokens > 1 ? 's' : ''}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(tier)}
                    disabled={isLoading === tier.priceId}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      tier.popular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    } ${
                      isLoading === tier.priceId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading === tier.priceId ? 'Processing...' : 'Get Started'}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* FAQ or Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <p className="text-white/60 text-sm">
                All plans include commercial usage rights • Cancel anytime • Secure payments powered by Paddle
              </p>
            </motion.div>
          </div>
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