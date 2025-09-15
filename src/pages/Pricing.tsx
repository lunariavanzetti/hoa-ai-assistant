import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Star,
  Video,
  Play,
  Crown,
  Sparkles,
  Download,
  Clock,
  Zap,
  Award,
  CreditCard
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'
import { useToast } from '@/components/ui/Toaster'

interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
  icon: React.ReactNode
  badge?: string
  popular?: boolean
  features: {
    videos: number | 'unlimited'
    quality: string[]
    support: string
    extras: string[]
  }
  highlights: string[]
  targetAudience: string
  priceId?: string
}

// Helper function to get environment-specific price IDs
const getPriceId = (plan: string) => {
  const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'

  // Use Paddle's official demo price for testing in sandbox
  if (environment === 'sandbox') {
    console.log('🧪 Using Paddle demo price for sandbox testing')
    return 'pri_01gsz91wy9k1yn7kx82aafwvea' // Paddle's official demo price
  }

  // Production price IDs (you'll need to create these in Paddle)
  const priceMap: Record<string, string> = {
    'pay_per_video': import.meta.env.VITE_PADDLE_PAY_PER_VIDEO_PRICE_ID || 'pri_video_pay_per_use_249',
    'basic': import.meta.env.VITE_PADDLE_BASIC_MONTHLY_PRICE_ID || 'pri_01k1jmkp73zpywnccyq39vea1s',
    'premium': import.meta.env.VITE_PADDLE_PREMIUM_MONTHLY_PRICE_ID || 'pri_01k1jmsk04pfsf5b34dwe5ej4a'
  }

  return priceMap[plan]
}

export const Pricing: React.FC = () => {
  const { user } = useAuthStore()
  const { error: showError } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const plans: PricingPlan[] = [
    {
      id: 'pay_per_video',
      name: 'Pay-Per-Video',
      price: 2.49,
      description: 'Perfect for occasional video creation',
      icon: <CreditCard className="w-8 h-8" />,
      features: {
        videos: 1,
        quality: ['HD (1080p)'],
        support: 'Email support',
        extras: [
          'Standard templates',
          'Basic AI enhancement',
          '7-day video storage',
          'Standard processing speed'
        ]
      },
      highlights: [
        'No monthly commitment',
        'Pay only when you need',
        'Perfect for testing'
      ],
      targetAudience: 'Casual users, small businesses',
      priceId: getPriceId('pay_per_video')
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      description: 'Great for regular content creators',
      icon: <Video className="w-8 h-8" />,
      badge: 'Most Popular',
      popular: true,
      features: {
        videos: 20,
        quality: ['HD (1080p)'],
        support: 'Priority email support',
        extras: [
          'Premium templates',
          'Advanced AI script generation',
          '30-day video storage',
          'Priority queue processing',
          'Commercial usage rights',
          'Batch video generation'
        ]
      },
      highlights: [
        '20 videos per month',
        'Professional quality',
        'Commercial license included'
      ],
      targetAudience: 'Content creators, marketers',
      priceId: getPriceId('basic')
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      description: 'For professionals and agencies',
      icon: <Crown className="w-8 h-8" />,
      badge: 'Best Value',
      features: {
        videos: 'unlimited',
        quality: ['HD (1080p)', '4K (2160p)'],
        support: 'Phone + email support',
        extras: [
          'All premium templates',
          'Advanced AI with custom prompts',
          'Unlimited storage',
          'Highest priority processing',
          'Commercial usage rights',
          'API access (coming soon)',
          'White-label options',
          'Custom branding',
          'Team collaboration'
        ]
      },
      highlights: [
        'Unlimited video generation',
        '4K quality videos',
        'Priority support'
      ],
      targetAudience: 'Agencies, enterprises',
      priceId: getPriceId('premium')
    }
  ]

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to subscribe to a plan')
      return
    }

    if (!plan.priceId) {
      showError('Plan Unavailable', 'This plan is not yet configured. Please contact support.')
      return
    }

    setLoading(plan.id)

    try {
      console.log('🎯 Opening checkout for plan:', plan.name)
      console.log('Price ID:', plan.priceId)
      console.log('User ID:', user.id)

      await paddleClient.openCheckout(plan.priceId, user.paddle_customer_id)
    } catch (error) {
      console.error('Checkout error:', error)

      if (error instanceof Error) {
        if (error.message.includes('price')) {
          showError('Plan Configuration Error', `The ${plan.name} plan is not properly configured. Please contact support.`)
        } else {
          showError('Checkout Failed', error.message)
        }
      } else {
        showError('Checkout Failed', 'Unable to open checkout. Please try again.')
      }
    } finally {
      setLoading(null)
    }
  }

  const getButtonText = (plan: PricingPlan) => {
    if (loading === plan.id) return 'Opening checkout...'
    if (plan.id === 'pay_per_video') return 'Buy 1 Video'
    return `Start ${plan.name} Plan`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl lg:text-4xl font-bold">
          Choose Your AI Video Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Transform your ideas into stunning videos with AI. From casual creators to professional agencies,
          we have the perfect plan for your video generation needs.
        </p>
      </motion.div>

      {/* Video Generation Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 lg:p-8"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">Why Choose Kateriss AI Video Generator?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-xl glass-surface">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Advanced Gemini AI creates professional scripts and enhances your prompts
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-xl glass-surface">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Generate professional videos in minutes, not hours
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-xl glass-surface">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Pro Quality</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              4K video generation with professional templates and effects
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 p-3 rounded-xl glass-surface">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Save Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No video editing skills required - just describe and generate
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`glass-card p-6 lg:p-8 relative ${
              plan.popular ? 'ring-2 ring-purple-400 ring-opacity-50' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-xl glass-surface">
                {plan.icon}
              </div>

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-gray-500 ml-1">
                  {plan.id === 'pay_per_video' ? '/video' : '/month'}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {plan.description}
              </p>

              <p className="text-xs text-gray-500 font-medium">
                {plan.targetAudience}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Videos */}
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="font-semibold">
                  {plan.features.videos === 'unlimited' ? 'Unlimited' : plan.features.videos} videos
                  {plan.id !== 'pay_per_video' && ' per month'}
                </span>
              </div>

              {/* Quality */}
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>{plan.features.quality.join(' + ')}</span>
              </div>

              {/* Support */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>{plan.features.support}</span>
              </div>

              {/* Extra features */}
              <div className="space-y-2">
                {plan.features.extras.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Highlights */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Key Benefits
                </h4>
                <ul className="space-y-1">
                  {plan.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectPlan(plan)}
                disabled={loading === plan.id}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'btn-secondary'
                } flex items-center justify-center gap-2`}
              >
                {loading === plan.id ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Opening checkout...
                  </>
                ) : (
                  <>
                    {plan.id === 'pay_per_video' ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {getButtonText(plan)}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 lg:p-8"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">What video formats do you support?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We generate MP4 videos in HD (1080p) and 4K (2160p) quality, optimized for all major platforms including social media, presentations, and web use.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">How long does video generation take?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Most videos are generated within 2-5 minutes. Premium subscribers get priority processing for faster generation times.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Can I use videos commercially?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Basic and Premium subscribers get full commercial usage rights. Pay-per-video purchases include personal use only unless upgraded.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">What happens to unused videos?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Monthly plan videos don't roll over, but pay-per-video credits never expire. Consider our flexible pay-per-video option for occasional use.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center glass-card p-8"
      >
        <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          For enterprise customers with special requirements, we offer custom pricing,
          dedicated support, and specialized features.
        </p>
        <button className="btn-primary py-3 px-8">
          Contact Enterprise Sales
        </button>
      </motion.div>
    </div>
  )
}