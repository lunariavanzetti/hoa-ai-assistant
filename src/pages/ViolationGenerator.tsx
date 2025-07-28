import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Send, FileText, AlertCircle } from 'lucide-react'
import { openAIService, type ViolationData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const ViolationGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    residentName: '',
    residentAddress: '',
    violationType: '',
    description: '',
    managerName: 'HOA Management',
    severityLevel: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    photos: [] as File[]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [error, setError] = useState('')
  const { success, error: showError } = useToast()

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

    setIsGenerating(true)
    setError('')
    
    try {
      const violationData: ViolationData = {
        hoaName: 'Sunset Ridge Community HOA', // This could come from user's HOA settings
        propertyAddress: formData.residentAddress,
        residentName: formData.residentName,
        violationType: formData.violationType,
        violationDescription: formData.description,
        violationDate: new Date().toLocaleDateString(),
        managerName: formData.managerName,
        managerTitle: 'Community Manager',
        severityLevel: formData.severityLevel,
        photoAttached: formData.photos.length > 0,
        previousViolationsCount: 0, // This could come from database
        ccrSection: 'Section 3.1 - Community Standards'
      }

      const letter = await openAIService.generateViolationLetter(violationData)
      setGeneratedLetter(letter)
      success('Letter Generated!', 'Professional violation letter created successfully')
    } catch (error) {
      console.error('Error generating letter:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate letter'
      setError(errorMessage)
      showError('Generation Failed', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">AI Violation Letter Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create professional violation notices in seconds with AI assistance.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
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
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-liquid h-32 resize-none"
                placeholder="Describe the violation in detail..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center glass-surface">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Upload violation photos</p>
                <button className="btn-secondary">Choose Files</button>
              </div>
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
    </div>
  )
}