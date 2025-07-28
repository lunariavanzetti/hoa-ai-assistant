import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Clock, Star, Check } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthStore } from '@/stores/auth'
import { useNavigate } from 'react-router-dom'

export const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { signInWithProvider } = useAuthStore()

  const handleGetStarted = () => {
    navigate('/auth')
  }

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      await signInWithProvider(provider)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle Background */}
      <div className="particle-bg">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 nav-liquid">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-xl font-bold text-gradient">Kateriss</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={handleGetStarted}
              className="btn-secondary"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="heading-display mb-8">
              HOA Management
              <br />
              <span className="text-gradient">Powered by AI</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Save 10+ hours per week with AI-powered violation letters, complaint responses, 
              meeting summaries, and monthly reports. The future of HOA management is here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.button
                onClick={handleGetStarted}
                className="btn-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={() => handleSignIn('google')}
                className="btn-secondary text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue with Google
              </motion.button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-8 mb-20"
          >
            <div className="glass-card magnetic-hover p-8">
              <Zap className="w-12 h-12 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">AI Violation Letters</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate professional violation notices in seconds with AI that understands HOA regulations.
              </p>
            </div>

            <div className="glass-card magnetic-hover p-8">
              <Shield className="w-12 h-12 text-green-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">Smart Complaint Handling</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered responses to resident complaints that maintain professionalism and community harmony.
              </p>
            </div>

            <div className="glass-card magnetic-hover p-8">
              <Clock className="w-12 h-12 text-blue-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-3">Automated Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monthly performance reports generated automatically from your HOA's activity data.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="heading-2 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your HOA management needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold text-gradient mb-4">$0</div>
                <p className="text-gray-600 dark:text-gray-300">Perfect for small HOAs</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>1 HOA Property</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>10 AI Letters/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Basic complaint handling</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Monthly reports</span>
                </li>
              </ul>
              
              <button 
                onClick={handleGetStarted}
                className="btn-secondary w-full"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="glass-card p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gradient mb-4">$49</div>
                <p className="text-gray-600 dark:text-gray-300">For growing communities</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>3 HOA Properties</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>100 AI Letters/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Priority AI responses</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Meeting transcriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              
              <button 
                onClick={handleGetStarted}
                className="btn-primary w-full"
              >
                Start Pro Trial
              </button>
            </div>

            {/* Agency Plan */}
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Agency</h3>
                <div className="text-4xl font-bold text-gradient mb-4">$149</div>
                <p className="text-gray-600 dark:text-gray-300">For management companies</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>10+ HOA Properties</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Unlimited AI usage</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>White-label options</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <button 
                onClick={handleGetStarted}
                className="btn-secondary w-full"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 from 500+ HOA managers</span>
            </div>
            
            <blockquote className="text-xl italic text-gray-600 dark:text-gray-300 mb-8">
              "Kateriss has transformed how we manage our community. What used to take hours now takes minutes. 
              The AI-generated letters are professional and compliant, saving us countless hours every week."
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="text-left">
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-gray-600 dark:text-gray-400">HOA Manager, Sunset Ridge Community</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}