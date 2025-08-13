import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Star, 
  Shield, 
  Building2, 
  Crown,
  FileText,
  MessageCircle,
  Mic,
  BarChart3,
  Phone,
  Clock,
  Zap,
  Award
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
    letters: number | 'unlimited'
    complaints: number | 'unlimited'
    meetings: number | 'unlimited'
    reports: number | 'unlimited'
    support: string
    extras: string[]
  }
  highlights: string[]
  targetAudience: string
  priceId?: string
}

// Helper function to get environment-specific price IDs
const getPriceId = (plan: string, cycle: 'monthly' | 'yearly') => {
  const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'production' | 'sandbox'
  
  // TEMPORARY: Use test prices for Pro and Agency during testing
  const TEST_MODE = true // Set to false after testing
  
  if (TEST_MODE && environment === 'production' && (plan === 'pro' || plan === 'agency')) {
    const testPriceKey = `VITE_PADDLE_PRODUCTION_TEST_${plan.toUpperCase()}_${cycle.toUpperCase()}_PRICE_ID`
    const testPriceId = (import.meta.env as any)[testPriceKey]
    console.log('🧪 Using test price:', testPriceKey, '=', testPriceId)
    return testPriceId
  }
  
  // Use Paddle's official demo price for testing in sandbox
  if (environment === 'sandbox') {
    console.log('🧪 Using Paddle demo price for sandbox testing')
    return 'pri_01gsz91wy9k1yn7kx82aafwvea' // Paddle's official demo price
  }
  
  const prefix = 'VITE_PADDLE_PRODUCTION'
  const priceKey = `${prefix}_${plan.toUpperCase()}_${cycle.toUpperCase()}_PRICE_ID`
  return (import.meta.env as any)[priceKey]
}

export const Pricing: React.FC = () => {
  const { user } = useAuthStore()
  const { error } = useToast()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for small HOAs testing AI automation',
      icon: <Shield className="w-8 h-8" />,
      features: {
        letters: 5,
        complaints: 10,
        meetings: 2,
        reports: 1,
        support: 'Email support',
        extras: [
          'Basic templates',
          'Photo upload',
          'Standard features'
        ]
      },
      highlights: [
        'Try before you buy',
        'No credit card required',
        'Perfect for small communities'
      ],
      targetAudience: 'HOAs under 50 units'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? 9 : 90,
      description: 'Professional HOA management for growing communities',
      icon: <Building2 className="w-8 h-8" />,
      features: {
        letters: 50,
        complaints: 200,
        meetings: 10,
        reports: 5,
        support: 'Priority email support',
        extras: [
          'Custom templates',
          'Advanced photo management',
          'Usage analytics',
          'PDF exports',
          'Data export'
        ]
      },
      highlights: [
        '10x more capacity than Free',
        'Professional templates',
        'Priority support'
      ],
      targetAudience: 'HOAs with 50-300 units',
      priceId: getPriceId('pro', billingCycle)
    },
    {
      id: 'agency',
      name: 'Agency',
      price: billingCycle === 'monthly' ? 19 : 190,
      description: 'Unlimited solution for large HOAs and property managers',
      icon: <Star className="w-8 h-8" />,
      badge: 'Most Popular',
      popular: true,
      features: {
        letters: 'unlimited',
        complaints: 'unlimited',
        meetings: 'unlimited',
        reports: 'unlimited',
        support: 'Phone & email support',
        extras: [
          'Multi-property management',
          'Advanced analytics',
          'Custom branding',
          'Bulk operations',
          'API access',
          'White-label options'
        ]
      },
      highlights: [
        'No usage limits',
        'Multi-property support',
        'Advanced features'
      ],
      targetAudience: 'Large HOAs (300+ units)',
      priceId: getPriceId('agency', billingCycle)
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 49 : 490,
      description: 'Premium solution with dedicated support and custom integrations',
      icon: <Crown className="w-8 h-8" />,
      features: {
        letters: 'unlimited',
        complaints: 'unlimited',
        meetings: 'unlimited',
        reports: 'unlimited',
        support: '24/7 dedicated support',
        extras: [
          'Everything in Agency',
          'Dedicated account manager',
          'Custom integrations',
          'Custom AI training',
          'SSO authentication',
          'SLA guarantee (99.9%)',
          'Custom workflows',
          'Migration assistance'
        ]
      },
      highlights: [
        'Dedicated account manager',
        'Custom integrations',
        'Enterprise security'
      ],
      targetAudience: 'Property management companies',
      priceId: getPriceId('enterprise', billingCycle)
    }
  ]

  const handleSelectPlan = async (plan: PricingPlan) => {
    console.log('=== PLAN SELECTION DEBUG ===')
    console.log('Selected plan:', plan.id)
    console.log('Plan priceId:', plan.priceId)
    console.log('Environment:', import.meta.env.VITE_PADDLE_ENVIRONMENT)
    
    // Debug all environment variables
    console.log('All Paddle Environment Variables:')
    Object.keys(import.meta.env).filter(key => key.includes('PADDLE')).forEach(key => {
      console.log(`${key}:`, (import.meta.env as any)[key] || 'MISSING')
    })
    console.log('=== END PLAN DEBUG ===')

    if (plan.id === 'free') {
      // Free plan - redirect to signup
      window.location.href = '/auth'
      return
    }

    if (!plan.priceId) {
      console.error('Missing price ID for plan:', plan.id)
      console.error('Expected variable name:', `VITE_PADDLE_SANDBOX_${plan.id.toUpperCase()}_${billingCycle.toUpperCase()}_PRICE_ID`)
      error('Billing Coming Soon', 'Payment processing is being set up. Check back soon!')
      return
    }

    // Check if Paddle is configured
    const env = import.meta.env.VITE_PADDLE_ENVIRONMENT
    const clientToken = env === 'sandbox' 
      ? import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN
      : import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN

    if (!clientToken) {
      console.error('Missing client token for environment:', env)
      error('Billing Coming Soon', 'Payment processing is being set up. Check back soon!')
      return
    }

    if (!user) {
      // Redirect to auth with plan selection
      localStorage.setItem('selectedPlan', plan.id)
      window.location.href = '/auth'
      return
    }

    console.log('=== PADDLE CHECKOUT DEBUG ===')
    console.log('User:', user?.id)
    console.log('Plan:', plan.id)
    console.log('Billing Cycle:', billingCycle)
    console.log('Plan Price ID:', plan.priceId)
    console.log('Environment Variables Check:')
    const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT
    console.log('VITE_PADDLE_ENVIRONMENT:', environment)
    
    if (environment === 'sandbox') {
      console.log('VITE_PADDLE_SANDBOX_CLIENT_TOKEN:', !!import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN)
      console.log('Sandbox Price IDs:')
      console.log('- PRO_MONTHLY:', import.meta.env.VITE_PADDLE_SANDBOX_PRO_MONTHLY_PRICE_ID)
      console.log('- PRO_YEARLY:', import.meta.env.VITE_PADDLE_SANDBOX_PRO_YEARLY_PRICE_ID)
      console.log('- AGENCY_MONTHLY:', import.meta.env.VITE_PADDLE_SANDBOX_AGENCY_MONTHLY_PRICE_ID)
      console.log('- AGENCY_YEARLY:', import.meta.env.VITE_PADDLE_SANDBOX_AGENCY_YEARLY_PRICE_ID)
      console.log('- ENTERPRISE_MONTHLY:', import.meta.env.VITE_PADDLE_SANDBOX_ENTERPRISE_MONTHLY_PRICE_ID)
      console.log('- ENTERPRISE_YEARLY:', import.meta.env.VITE_PADDLE_SANDBOX_ENTERPRISE_YEARLY_PRICE_ID)
    } else {
      console.log('VITE_PADDLE_PRODUCTION_CLIENT_TOKEN:', !!import.meta.env.VITE_PADDLE_PRODUCTION_CLIENT_TOKEN)
      console.log('Production Price IDs:')
      console.log('- PRO_MONTHLY:', import.meta.env.VITE_PADDLE_PRODUCTION_PRO_MONTHLY_PRICE_ID)
      console.log('- PRO_YEARLY:', import.meta.env.VITE_PADDLE_PRODUCTION_PRO_YEARLY_PRICE_ID)
      console.log('- AGENCY_MONTHLY:', import.meta.env.VITE_PADDLE_PRODUCTION_AGENCY_MONTHLY_PRICE_ID)
      console.log('- AGENCY_YEARLY:', import.meta.env.VITE_PADDLE_PRODUCTION_AGENCY_YEARLY_PRICE_ID)
      console.log('- ENTERPRISE_MONTHLY:', import.meta.env.VITE_PADDLE_PRODUCTION_ENTERPRISE_MONTHLY_PRICE_ID)
      console.log('- ENTERPRISE_YEARLY:', import.meta.env.VITE_PADDLE_PRODUCTION_ENTERPRISE_YEARLY_PRICE_ID)
    }
    console.log('=== END DEBUG ===')

    setLoading(plan.id)
    try {
      console.log('Opening checkout for plan:', plan.id, 'with priceId:', plan.priceId)
      console.log('User paddle_customer_id:', user.paddle_customer_id)
      await paddleClient.openCheckout(plan.priceId!, user.paddle_customer_id)
    } catch (err) {
      console.error('Checkout error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        priceId: plan.priceId,
        customerId: user.paddle_customer_id
      })
      error('Checkout Error', `Failed to open billing checkout: ${err instanceof Error ? err.message : 'Unknown error'}. Check console for details.`)
    } finally {
      setLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return billingCycle === 'yearly' 
      ? `$${Math.round(price / 12)}/mo`
      : `$${price}/mo`
  }

  const formatFeature = (value: number | 'unlimited') => {
    return value === 'unlimited' ? 'Unlimited' : value.toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 sm:space-y-6"
      >
        <h1 className="heading-1 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">CHOOSE YOUR PLAN</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
          Transform your HOA management with AI automation. From small communities to large property portfolios, 
          we have the perfect solution for your needs.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span className={`text-sm sm:text-base font-medium ${billingCycle === 'monthly' ? 'text-brutal-electric' : 'text-gray-600'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-brutal-electric' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 left-1 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
            }`} />
          </button>
          <span className={`text-sm sm:text-base font-medium ${billingCycle === 'yearly' ? 'text-brutal-electric' : 'text-gray-600'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="bg-brutal-electric text-black px-2 py-1 text-xs font-bold rounded whitespace-nowrap">
              2 MONTHS FREE
            </span>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`brutal-card p-4 sm:p-6 lg:p-8 relative ${
              plan.popular ? 'border-brutal-electric border-2 sm:border-4' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-brutal-electric text-black px-3 sm:px-4 py-1 text-xs font-bold uppercase">
                  {plan.badge}
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="text-brutal-electric mx-auto">
                {plan.icon}
              </div>
              <div>
                <h3 className="heading-3 text-lg sm:text-xl lg:text-2xl mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                  {plan.description}
                </p>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {formatPrice(plan.price)}
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <div className="text-xs sm:text-sm text-gray-500">
                      ${plan.price}/year
                    </div>
                  )}
                  <div className="text-xs text-gray-500 uppercase">
                    {plan.targetAudience}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              {/* Core Features */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Violation Letters</span>
                  </div>
                  <span className="font-bold">{formatFeature(plan.features.letters)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Complaint Responses</span>
                  </div>
                  <span className="font-bold">{formatFeature(plan.features.complaints)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Meeting Summaries</span>
                  </div>
                  <span className="font-bold">{formatFeature(plan.features.meetings)}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Monthly Reports</span>
                  </div>
                  <span className="font-bold">{formatFeature(plan.features.reports)}</span>
                </div>
              </div>

              {/* Support */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{plan.features.support}</span>
                </div>
              </div>

              {/* Extra Features */}
              <div className="space-y-1 sm:space-y-2">
                {plan.features.extras.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={loading === plan.id}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-bold uppercase tracking-wide transition-all ${
                plan.popular
                  ? 'btn-primary'
                  : 'btn-secondary'
              } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading === plan.id ? (
                <div className="loading-liquid mx-auto"></div>
              ) : plan.id === 'free' ? (
                'Get Started Free'
              ) : user?.subscription_tier === plan.id ? (
                'Current Plan'
              ) : (
                `Upgrade to ${plan.name}`
              )}
            </button>

            {/* Highlights */}
            <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2">
              {plan.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Zap className="w-3 h-3 text-brutal-electric flex-shrink-0" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="brutal-card p-4 sm:p-6 lg:p-8"
      >
        <h2 className="heading-2 text-lg sm:text-xl lg:text-2xl xl:text-3xl text-center mb-6 sm:mb-8">FREQUENTLY ASKED QUESTIONS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately 
                and you'll be prorated for the difference.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">What happens if I exceed my limits?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                You'll receive notifications when approaching your limits. You can upgrade anytime to 
                continue using the service without interruption.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Yes! Our Free plan lets you test all core features with generous limits. 
                No credit card required to get started.
              </p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                We accept all major credit cards, PayPal, and ACH bank transfers. 
                All payments are processed securely through Paddle.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Absolutely! Cancel anytime with no cancellation fees. Your subscription 
                remains active until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-base font-bold mb-2">Do you offer discounts for annual plans?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Yes! Annual plans save you 2 months (17% discount) compared to monthly billing. 
                Switch to yearly billing to unlock these savings.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-6 sm:space-y-8"
      >
        <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Secure Payment Processing</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">30-Day Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">SOC 2 Compliant</span>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-500 px-4">
          Join 500+ HOA managers already saving 10+ hours per week with AI automation
        </p>
      </motion.div>
    </div>
  )
}