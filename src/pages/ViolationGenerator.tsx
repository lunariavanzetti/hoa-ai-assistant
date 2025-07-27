import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Send, FileText } from 'lucide-react'

export const ViolationGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    residentName: '',
    residentAddress: '',
    violationType: '',
    description: '',
    photos: [] as File[]
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')

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
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedLetter(`Dear ${formData.residentName},

This letter serves as formal notice that your property at ${formData.residentAddress} is in violation of our community guidelines.

Violation Type: ${formData.violationType}
Description: ${formData.description}
Date Observed: ${new Date().toLocaleDateString()}

You have 14 days from the date of this notice to correct this violation. Please contact our office if you need assistance or have questions.

Sincerely,
HOA Management`)
      setIsGenerating(false)
    }, 2000)
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

            <div>
              <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center glass-surface">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Upload violation photos</p>
                <button className="btn-secondary">Choose Files</button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!formData.residentName || !formData.violationType || isGenerating}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="loading-liquid w-5 h-5"></div>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Letter
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
            <div className="glass-surface p-6 rounded-xl">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedLetter}
              </pre>
            </div>
          ) : (
            <div className="glass-surface p-8 rounded-xl text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Fill out the form to generate your violation letter
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}