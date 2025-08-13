import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, FileText, AlertCircle } from 'lucide-react'
import { openAIService, type ViolationData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { storageService } from '@/lib/storage'
import { useUsageLimits } from '@/hooks/useUsageLimits'
import { UsageDisplay } from '@/components/ui/UsageDisplay'
import { usageTrackingService } from '@/lib/usageTracking'
import { useAuthStore } from '@/stores/auth'

export const ViolationGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    residentName: '',
    residentAddress: '',
    violationType: '',
    description: '',
    violationDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    managerName: 'HOA Management',
    severityLevel: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    photos: [] as File[]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [error, setError] = useState('')
  const [_uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([])
  const { success, error: showError } = useToast()
  const { checkUsageLimit, UpgradeModalComponent } = useUsageLimits()
  const { user } = useAuthStore()

  const violationTypes = [
    'Landscaping/Lawn Care',
    'Parking Violations',
    'Architectural Changes',
    'Noise Complaints',
    'Pet Violations',
    'Trash/Recycling',
    'Other'
  ]

  const handleGenerate = async () => {
    if (!formData.residentName || !formData.violationType || !formData.description) {
      showError('Missing Information', 'Please fill in all required fields')
      return
    }

    // Check usage limits before proceeding
    checkUsageLimit('violation_letters', async () => {
      setIsGenerating(true)
      setError('')
      
      try {
      // Upload photos first if any
      let photoUrls: string[] = []
      if (formData.photos.length > 0) {
        // Add a flag to temporarily disable photo upload for testing
        const SKIP_PHOTO_UPLOAD = import.meta.env.VITE_SKIP_PHOTO_UPLOAD === 'true'
        
        if (SKIP_PHOTO_UPLOAD) {
          console.log('📷 Photo upload disabled via environment variable')
          showError('Photo Upload Disabled', 'Photo upload is temporarily disabled. Continuing without photos.')
          photoUrls = []
        } else {
        try {
          console.log('📤 Starting photo upload...', formData.photos.length, 'photos')
          
          // Add a 10-second timeout as final fallback to prevent infinite hang
          const uploadPromises = formData.photos.map((photo, index) => {
            console.log(`📁 Uploading photo ${index + 1}:`, photo.name, photo.size)
            return storageService.uploadPhoto(photo)
          })
          
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Upload taking too long - continuing without photos'))
            }, 10000) // 10 second fallback timeout
          })
          
          console.log('⏱️ Starting upload (10s fallback timeout)...')
          const uploadResults = await Promise.race([
            Promise.all(uploadPromises),
            timeoutPromise
          ])
          
          photoUrls = uploadResults.map(result => result.url)
          setUploadedPhotoUrls(photoUrls)
          console.log('✅ Photo upload successful:', photoUrls)
          success('Photos Uploaded!', `Successfully uploaded ${photoUrls.length} photo(s)`)
        } catch (uploadError) {
          console.error('❌ Photo upload failed:', uploadError)
          if (uploadError instanceof Error && uploadError.message.includes('taking too long')) {
            showError('Photo Upload Timeout', 'Photo upload is taking too long. This may be a Supabase configuration issue. Continuing without photos.')
          } else {
            showError('Photo Upload Failed', `Could not upload photos: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}. Continuing without photos.`)
          }
          // Continue without photos - don't block the violation generation
          photoUrls = [] // Ensure it's empty array
        }
        }
      }

      const violationData: ViolationData = {
        hoaName: 'Sunset Ridge Community HOA', // This could come from user's HOA settings
        propertyAddress: formData.residentAddress,
        residentName: formData.residentName,
        violationType: formData.violationType,
        violationDescription: formData.description,
        violationDate: new Date(formData.violationDate).toLocaleDateString(),
        managerName: formData.managerName,
        managerTitle: 'Community Manager',
        severityLevel: formData.severityLevel,
        photoAttached: formData.photos.length > 0,
        previousViolationsCount: 0, // This could come from database
        ccrSection: 'Section 3.1 - Community Standards'
      }

      const letter = await openAIService.generateViolationLetter(violationData)
      setGeneratedLetter(letter)
      
      // Track this activity for analytics
      if (user?.id) {
        await usageTrackingService.trackActivity(
          user.id,
          'violation_letter',
          `Violation Letter - ${formData.violationType}`,
          letter,
          {
            resident_name: formData.residentName,
            property_address: formData.residentAddress,
            violation_type: formData.violationType,
            severity_level: formData.severityLevel,
            photos_attached: formData.photos.length > 0,
            photo_count: formData.photos.length
          }
        )
      }
      
      success('Letter Generated!', `Professional violation letter created${photoUrls.length > 0 ? ` with ${photoUrls.length} photos` : ''}`)
    } catch (error) {
      console.error('Error generating letter:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate letter'
      setError(errorMessage)
      showError('Generation Failed', errorMessage)
      } finally {
        setIsGenerating(false)
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6 lg:p-8"
      >
        <h1 className="heading-2 text-xl sm:text-2xl lg:text-3xl mb-2">AI Violation Letter Generator</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Create professional violation notices in seconds with AI assistance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold mb-6">Violation Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Resident Name</label>
              <input
                type="text"
                value={formData.residentName}
                onChange={(e) => setFormData(prev => ({ ...prev, residentName: e.target.value }))}
                className="input-liquid"
                placeholder="Enter resident's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Property Address</label>
              <input
                type="text"
                value={formData.residentAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, residentAddress: e.target.value }))}
                className="input-liquid"
                placeholder="Enter property address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Violation Type</label>
              <select
                value={formData.violationType}
                onChange={(e) => setFormData(prev => ({ ...prev, violationType: e.target.value }))}
                className="input-liquid"
              >
                <option value="">Select violation type</option>
                {violationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Violation Date *</label>
              <input
                type="date"
                value={formData.violationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, violationDate: e.target.value }))}
                className="input-liquid"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-liquid h-32 resize-none"
                placeholder="Describe the violation in detail..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Manager Name</label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                  className="input-liquid"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Severity Level</label>
                <select
                  value={formData.severityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, severityLevel: e.target.value as any }))}
                  className="input-liquid"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
              <PhotoUpload
                photos={formData.photos}
                onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                maxPhotos={5}
              />
            </div>

            {error && (
              <div className="glass-surface p-4 rounded-xl border border-red-300 bg-red-50/10">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!formData.residentName || !formData.violationType || !formData.description || isGenerating}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="loading-liquid w-5 h-5"></div>
                  <span>Generating AI Letter...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate AI Letter
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Letter Preview</h2>
            {generatedLetter && (
              <button className="btn-secondary flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Letter
              </button>
            )}
          </div>

          {generatedLetter ? (
            <div className="glass-surface p-6 rounded-xl max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {generatedLetter}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-surface p-8 rounded-xl text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Fill out the form to generate your AI-powered violation letter
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Professional, legally-compliant letters generated in seconds
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Usage Limits Indicator */}
      <div className="glass-card p-4 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
        <UsageDisplay feature="violation_letters" className="text-amber-800 dark:text-amber-200" />
      </div>

      <UpgradeModalComponent />
    </div>
  )
}