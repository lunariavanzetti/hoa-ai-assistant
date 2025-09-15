import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles, Video, Download, Eye } from 'lucide-react'
import { geminiVideoService, type VideoProject, type PromptEnhancementResult } from '@/lib/geminiClient'
import { useToast } from '@/components/ui/Toaster'
import { useUsageLimits } from '@/hooks/useUsageLimits'
import { UsageDisplay } from '@/components/ui/UsageDisplay'
import { usageTrackingService } from '@/lib/usageTracking'
import { useAuthStore } from '@/stores/auth'

export const VideoGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    style: 'professional',
    quality: 'hd' as 'hd' | '4k',
    duration: 'auto' as 'short' | 'medium' | 'long' | 'auto',
    template: 'modern'
  })

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [enhancementResult, setEnhancementResult] = useState<PromptEnhancementResult | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<VideoProject | null>(null)
  const [error, setError] = useState('')
  const [generationStep, setGenerationStep] = useState<'idle' | 'enhancing' | 'scripting' | 'generating' | 'completed'>('idle')

  const { success, error: showError } = useToast()
  const { checkUsageLimit, UpgradeModalComponent } = useUsageLimits()
  const { user } = useAuthStore()

  const videoStyles = [
    { value: 'professional', label: 'Professional', description: 'Clean, business-oriented style' },
    { value: 'creative', label: 'Creative', description: 'Artistic and dynamic visuals' },
    { value: 'minimal', label: 'Minimal', description: 'Simple, elegant design' },
    { value: 'energetic', label: 'Energetic', description: 'High-energy with dynamic transitions' },
    { value: 'educational', label: 'Educational', description: 'Clear, instructional format' }
  ]

  const templates = [
    { value: 'modern', label: 'Modern Slideshow', description: 'Clean transitions, professional look' },
    { value: 'dynamic', label: 'Dynamic Intro', description: 'High-energy with animations' },
    { value: 'tutorial', label: 'Tutorial Format', description: 'Educational content structure' },
    { value: 'social', label: 'Social Media', description: 'Optimized for social platforms' },
    { value: 'presentation', label: 'Presentation', description: 'Corporate presentation style' }
  ]

  const durationOptions = [
    { value: 'auto', label: 'Auto', description: 'AI determines optimal length' },
    { value: 'short', label: '15-30s', description: 'Perfect for social media' },
    { value: 'medium', label: '30-60s', description: 'Standard promotional video' },
    { value: 'long', label: '60-120s', description: 'Detailed explanation video' }
  ]

  const handleEnhancePrompt = async () => {
    if (!formData.prompt.trim()) {
      showError('Missing Prompt', 'Please enter a video description or topic')
      return
    }

    setIsEnhancing(true)
    setError('')
    setGenerationStep('enhancing')

    try {
      const result = await geminiVideoService.enhancePrompt(formData.prompt)
      setEnhancementResult(result)
      success('Prompt Enhanced!', 'AI has enhanced your prompt with creative suggestions')
    } catch (error) {
      console.error('Error enhancing prompt:', error)
      setError(error instanceof Error ? error.message : 'Failed to enhance prompt')
      showError('Enhancement Failed', 'Could not enhance your prompt. Please try again.')
    } finally {
      setIsEnhancing(false)
      setGenerationStep('idle')
    }
  }

  const handleGenerateVideo = async () => {
    if (!formData.title || !formData.prompt) {
      showError('Missing Information', 'Please provide both a title and description')
      return
    }

    // Check usage limits before proceeding
    checkUsageLimit('videos', async () => {
      setIsGenerating(true)
      setError('')
      setGenerationStep('scripting')

      try {
        // Step 1: Enhance prompt if not already enhanced
        let finalPrompt = formData.prompt
        if (enhancementResult) {
          finalPrompt = enhancementResult.enhancedPrompt
        } else {
          const enhancement = await geminiVideoService.enhancePrompt(formData.prompt)
          finalPrompt = enhancement.enhancedPrompt
        }

        // Step 2: Generate script
        setGenerationStep('scripting')
        const script = await geminiVideoService.generateScript(finalPrompt)

        // Step 3: Generate video
        setGenerationStep('generating')
        const videoProject: Omit<VideoProject, 'id' | 'createdAt'> = {
          title: formData.title,
          originalPrompt: formData.prompt,
          enhancedPrompt: finalPrompt,
          videoScript: script,
          status: 'processing',
          quality: formData.quality
        }

        const result = await geminiVideoService.generateVideo(videoProject)

        if (result.success && result.videoProject) {
          setGeneratedVideo(result.videoProject)
          setGenerationStep('completed')

          // Track usage
          if (user?.id) {
            await usageTrackingService.trackActivity(
              user.id,
              'video_generated',
              formData.title,
              `Generated video: ${formData.title}`,
              {
                quality: formData.quality,
                template: formData.template,
                duration: result.videoProject.duration || 0
              }
            )
          }

          success('Video Generated!', 'Your AI video has been created successfully')
        } else {
          throw new Error(result.error || 'Video generation failed')
        }

      } catch (error) {
        console.error('Error generating video:', error)
        setError(error instanceof Error ? error.message : 'Failed to generate video')
        showError('Generation Failed', 'Could not generate your video. Please try again.')
        setGenerationStep('idle')
      } finally {
        setIsGenerating(false)
      }
    })
  }

  const getStepProgress = () => {
    switch (generationStep) {
      case 'enhancing': return 20
      case 'scripting': return 40
      case 'generating': return 80
      case 'completed': return 100
      default: return 0
    }
  }

  const getStepText = () => {
    switch (generationStep) {
      case 'enhancing': return 'Enhancing your prompt with AI...'
      case 'scripting': return 'Creating video script...'
      case 'generating': return 'Generating video with VEO 3 FAST...'
      case 'completed': return 'Video generation completed!'
      default: return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 lg:p-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl glass-surface">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Video Generator</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Transform your ideas into professional videos with AI
            </p>
          </div>
        </div>

        <UsageDisplay feature="videos" />
      </motion.div>

      {/* Video Generation Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Create Your Video
        </h2>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a catchy title for your video..."
              className="w-full p-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          {/* Main Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video Description *
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Describe your video idea in detail. Be creative and specific about what you want to show..."
              rows={4}
              className="w-full p-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
            />

            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Be specific about visuals, mood, and style for best results
              </p>
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !formData.prompt.trim()}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isEnhancing ? (
                  <>
                    <div className="w-3 h-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Enhance with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Prompt Display */}
          {enhancementResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-surface p-4 rounded-xl border border-green-200 dark:border-green-800"
            >
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Enhanced Prompt
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {enhancementResult.enhancedPrompt}
              </p>
              {enhancementResult.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Creative Suggestions:</h4>
                  <ul className="text-xs space-y-1">
                    {enhancementResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        <span className="text-gray-600 dark:text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Video Style</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full p-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                {videoStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {videoStyles.find(s => s.value === formData.style)?.description}
              </p>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Video Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value as 'hd' | '4k' })}
                className="w-full p-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="hd">HD (1080p) - Standard</option>
                <option value="4k">4K (2160p) - Premium Only</option>
              </select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                className="w-full p-3 rounded-xl glass-surface border border-white/10 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template) => (
                <motion.button
                  key={template.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, template: template.value })}
                  className={`p-3 rounded-xl text-left transition-all ${
                    formData.template === template.value
                      ? 'glass-surface border-2 border-purple-400 bg-purple-400/10'
                      : 'glass-surface border border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  <h4 className="font-medium text-sm">{template.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generation Progress */}
          {(isGenerating || generationStep !== 'idle') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-surface p-4 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                <span className="font-medium">{getStepText()}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getStepProgress()}%` }}
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateVideo}
            disabled={isGenerating || !formData.title || !formData.prompt}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating Video...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate AI Video
              </>
            )}
          </motion.button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Generated Video Display */}
      {generatedVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-green-400" />
            Your Generated Video
          </h2>

          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
              {generatedVideo.thumbnailUrl ? (
                <img
                  src={generatedVideo.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">{generatedVideo.title}</p>
                    <p className="text-sm opacity-75">Video ready for preview</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="btn-primary py-2 px-4 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Play Video
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {generatedVideo.quality?.toUpperCase()} Quality
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {generatedVideo.duration || 45}s duration
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {generatedVideo.status}
              </span>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Video
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <UpgradeModalComponent />
    </div>
  )
}