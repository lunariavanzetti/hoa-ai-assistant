import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Target, TrendingUp, Calendar, UserCheck, AlertCircle, Sparkles } from 'lucide-react'
import { openAIService, type OnboardingData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const OnboardingDesigner: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    subscriptionTier: 'Pro',
    hoaSize: '100-300 units',
    experienceLevel: 'Intermediate',
    registrationDate: '',
    initialUsage: '',
    location: '',
    referralSource: 'Google Search',
    demoPreferences: 'Email tutorials',
    onboardingPhase: 'Welcome & Immediate Value',
    triggerEvent: 'Account creation confirmed',
    daysSinceRegistration: 1
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')
  const { success, error: showError } = useToast()

  const subscriptionTiers = [
    'Free Trial',
    'Pro',
    'Agency',
    'Enterprise'
  ]

  const hoaSizes = [
    '50-100 units (Small)',
    '100-300 units (Medium)',
    '300+ units (Large)',
    'Multi-property portfolio'
  ]

  const experienceLevels = [
    'Beginner',
    'Intermediate', 
    'Expert',
    'HOA Management Professional'
  ]

  const onboardingPhases = [
    'Welcome & Immediate Value (Days 1-3)',
    'Skill Building & Adoption (Days 4-14)',
    'Mastery & Retention (Days 15-30)',
    'Feature Abandonment Recovery',
    'Usage Plateau Recovery',
    'Upgrade Opportunity'
  ]

  const referralSources = [
    'Google Search',
    'Social Media',
    'Word of Mouth',
    'HOA Conference',
    'Property Management Company',
    'Direct Mail',
    'Partner Referral'
  ]

  const handleGenerate = async () => {
    if (!formData.userName || !formData.userEmail || !formData.registrationDate) {
      setError('Please fill in user name, email, and registration date')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const onboardingData: OnboardingData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        subscriptionTier: formData.subscriptionTier,
        hoaSize: formData.hoaSize,
        experienceLevel: formData.experienceLevel,
        registrationDate: formData.registrationDate,
        initialUsage: formData.initialUsage || 'New user, no activity yet',
        location: formData.location || 'United States',
        referralSource: formData.referralSource,
        demoPreferences: formData.demoPreferences || 'Email tutorials and quick-start guides',
        onboardingPhase: formData.onboardingPhase,
        triggerEvent: formData.triggerEvent,
        daysSinceRegistration: formData.daysSinceRegistration
      }

      const content = await openAIService.generateOnboardingContent(onboardingData)
      setGeneratedContent(content)
      success('Onboarding Content Generated!', 'Personalized user journey content created successfully')
    } catch (error) {
      console.error('Error generating content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate onboarding content'
      setError(errorMessage)
      showError('Generation Failed', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-8"
      >
        <h1 className="heading-2 mb-2">AI ONBOARDING DESIGNER</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create personalized user journeys that maximize adoption, reduce churn, and build long-term customer loyalty.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* User Profile */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              USER PROFILE
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">User Name *</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                  className="input-liquid"
                  placeholder="Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Email Address *</label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, userEmail: e.target.value }))}
                  className="input-liquid"
                  placeholder="sarah@sunsetridgehoa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Registration Date *</label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                  className="input-liquid"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">Subscription Tier</label>
                  <select
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData(prev => ({ ...prev, subscriptionTier: e.target.value }))}
                    className="input-liquid"
                  >
                    {subscriptionTiers.map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">HOA Size</label>
                  <select
                    value={formData.hoaSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, hoaSize: e.target.value }))}
                    className="input-liquid"
                  >
                    {hoaSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="input-liquid"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Usage & Preferences */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              USAGE & PREFERENCES
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Initial Usage Patterns</label>
                <textarea
                  value={formData.initialUsage}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialUsage: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Generated 2 violation letters, viewed dashboard twice, hasn't used other features..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Geographic Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="input-liquid"
                  placeholder="California, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Referral Source</label>
                <select
                  value={formData.referralSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
                  className="input-liquid"
                >
                  {referralSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Demo Preferences</label>
                <input
                  type="text"
                  value={formData.demoPreferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, demoPreferences: e.target.value }))}
                  className="input-liquid"
                  placeholder="Video tutorials, live demos, written guides"
                />
              </div>
            </div>
          </div>

          {/* Onboarding Context */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              ONBOARDING CONTEXT
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Current Phase</label>
                <select
                  value={formData.onboardingPhase}
                  onChange={(e) => setFormData(prev => ({ ...prev, onboardingPhase: e.target.value }))}
                  className="input-liquid"
                >
                  {onboardingPhases.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Trigger Event</label>
                <input
                  type="text"
                  value={formData.triggerEvent}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerEvent: e.target.value }))}
                  className="input-liquid"
                  placeholder="Account creation confirmed, feature abandonment, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Days Since Registration</label>
                <input
                  type="number"
                  value={formData.daysSinceRegistration}
                  onChange={(e) => setFormData(prev => ({ ...prev, daysSinceRegistration: parseInt(e.target.value) || 0 }))}
                  className="input-liquid"
                  min="1"
                  max="90"
                />
              </div>
            </div>

            {error && (
              <div className="brutal-surface p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 mt-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="loading-liquid"></div>
                  CREATING JOURNEY...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  GENERATE ONBOARDING CONTENT
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6" />
              PERSONALIZED ONBOARDING CONTENT
            </h2>
            
            {generatedContent ? (
              <div className="space-y-4">
                <div className="brutal-surface p-6 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="btn-secondary flex-1"
                  >
                    COPY CONTENT
                  </button>
                  <button className="btn-primary flex-1">
                    EXPORT EMAIL SEQUENCE
                  </button>
                </div>

                <div className="brutal-surface p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Success Strategy:</strong> This personalized onboarding content is designed to maximize 
                    user engagement, reduce churn, and accelerate time-to-value for your specific user profile.
                  </p>
                </div>
              </div>
            ) : (
              <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Personalized onboarding content will appear here
                </p>
                <p className="text-sm text-gray-500">
                  Fill out the user profile and onboarding context, then click "Generate Onboarding Content"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Onboarding Methodology */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card p-8"
      >
        <h2 className="heading-3 mb-6">COMPREHENSIVE ONBOARDING METHODOLOGY</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Immediate Value</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Deliver quick wins within first 3 days to build confidence and demonstrate ROI
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Progressive Adoption</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gradually introduce advanced features based on usage patterns and engagement
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Behavioral Triggers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Smart automation based on user actions, inactivity, and subscription usage
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Personalization</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tailored content based on HOA size, experience level, and subscription tier
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}