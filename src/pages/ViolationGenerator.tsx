import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Send, FileText, AlertCircle, CheckCircle, Download, Eye } from 'lucide-react'
import { ViolationLetterAgent, ViolationData, aiAgentUtils } from '../lib/aiAgents'
import { violationQueries } from '../lib/supabase'

export const ViolationGenerator: React.FC = () => {
  const [formData, setFormData] = useState<Partial<ViolationData>>({
    hoa_name: 'Sunset Ridge Homeowners Association',
    property_address: '',
    resident_name: '',
    violation_type: '',
    violation_description: '',
    violation_date: new Date().toISOString().split('T')[0],
    previous_violations_count: 0,
    ccr_section: '',
    manager_name: 'Sarah Johnson',
    manager_title: 'Community Manager',
    photo_attached: false,
    severity_level: 'medium',
    state: 'California'
  })
  
  const [photos, setPhotos] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const violationTypes = [
    'Landscaping/Lawn Care',
    'Parking Violations',
    'Architectural Changes',
    'Noise Complaints',
    'Pet Violations',
    'Trash/Recycling',
    'Safety Hazards',
    'Other'
  ]

  const severityLevels = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600', description: 'Minor issues, longer compliance timeline' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', description: 'Standard violations, normal timeline' },
    { value: 'high', label: 'High Priority', color: 'text-orange-600', description: 'Serious violations, shorter timeline' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', description: 'Immediate attention required' }
  ]

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPhotos(prev => [...prev, ...files])
    setFormData(prev => ({ ...prev, photo_attached: photos.length + files.length > 0 }))
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({ ...prev, photo_attached: photos.length - 1 > 0 }))
  }

  const handleGenerate = async () => {
    // Validate form data
    const errors = aiAgentUtils.validateViolationData(formData)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsGenerating(true)
    setValidationErrors([])

    try {
      // Generate the professional violation letter using the AI agent
      const letter = await ViolationLetterAgent.generateViolationLetter(formData as ViolationData)
      setGeneratedLetter(letter)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating letter:', error)
      setValidationErrors(['Failed to generate letter. Please try again.'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToDB = async () => {
    if (!generatedLetter) return

    try {
      const violationData = aiAgentUtils.formatViolationForDB(formData as ViolationData, generatedLetter)
      await violationQueries.create({
        ...violationData,
        hoa_id: 'temp-hoa-id' // This would come from user context
      })
      
      // Show success message or redirect
      alert('Violation letter saved successfully!')
    } catch (error) {
      console.error('Error saving to database:', error)
      alert('Failed to save letter. Please try again.')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `violation-letter-${formData.resident_name?.replace(/\s+/g, '-')}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDeadlineDays = () => {
    if (!formData.violation_type || !formData.severity_level) return 14
    return ViolationLetterAgent.getDeadlineDays(formData.violation_type, formData.severity_level)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">AI Violation Letter Generator</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Create legally compliant, professional violation notices with our comprehensive AI assistant.
        </p>
        
        {validationErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Validation Errors</h3>
            </div>
            <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Comprehensive Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">HOA Name *</label>
                <input
                  type="text"
                  value={formData.hoa_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hoa_name: e.target.value }))}
                  className="input-liquid"
                  placeholder="Enter HOA name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="input-liquid"
                  placeholder="e.g., California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Manager Name *</label>
                <input
                  type="text"
                  value={formData.manager_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                  className="input-liquid"
                  placeholder="Enter manager's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Manager Title *</label>
                <input
                  type="text"
                  value={formData.manager_title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_title: e.target.value }))}
                  className="input-liquid"
                  placeholder="e.g., Community Manager"
                />
              </div>
            </div>
          </div>

          {/* Resident Information */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Resident Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Resident Name *</label>
                <input
                  type="text"
                  value={formData.resident_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, resident_name: e.target.value }))}
                  className="input-liquid"
                  placeholder="Enter resident's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Property Address *</label>
                <input
                  type="text"
                  value={formData.property_address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                  className="input-liquid"
                  placeholder="Enter complete property address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Previous Violations Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.previous_violations_count || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, previous_violations_count: parseInt(e.target.value) || 0 }))}
                  className="input-liquid"
                  placeholder="Number of previous violations"
                />
              </div>
            </div>
          </div>

          {/* Violation Details */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6">Violation Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Violation Type *</label>
                <select
                  value={formData.violation_type || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, violation_type: e.target.value }))}
                  className="input-liquid"
                >
                  <option value="">Select violation type</option>
                  {violationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {severityLevels.map(level => (
                    <label key={level.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="radio"
                        name="severity"
                        value={level.value}
                        checked={formData.severity_level === level.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, severity_level: e.target.value as any }))}
                        className="text-blue-600"
                      />
                      <div>
                        <div className={`font-medium ${level.color}`}>{level.label}</div>
                        <div className="text-xs text-gray-500">{level.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Estimated deadline: {getDeadlineDays()} days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date Observed *</label>
                <input
                  type="date"
                  value={formData.violation_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, violation_date: e.target.value }))}
                  className="input-liquid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CC&R Section</label>
                <input
                  type="text"
                  value={formData.ccr_section || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ccr_section: e.target.value }))}
                  className="input-liquid"
                  placeholder="e.g., Section 4.2 - Landscape Standards"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank for auto-detection based on violation type</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Violation Description *</label>
                <textarea
                  value={formData.violation_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, violation_description: e.target.value }))}
                  className="input-liquid h-32 resize-none"
                  placeholder="Provide detailed description of the violation..."
                />
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photo Evidence
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center glass-surface">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">Upload violation photos</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {isGenerating ? (
              <div className="loading-liquid w-5 h-5"></div>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate Professional Letter
              </>
            )}
          </button>
        </motion.div>

        {/* Letter Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 h-fit"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Letter Preview
            </h2>
            {generatedLetter && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleSaveToDB}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Save & Send
                </button>
              </div>
            )}
          </div>

          {generatedLetter ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Professional letter generated successfully!
                </span>
              </div>
              
              <div className="glass-surface p-6 rounded-xl max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {generatedLetter}
                </pre>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Letter complies with fair housing laws and state regulations</p>
                <p>• Includes proper legal disclaimers and appeal process</p>
                <p>• Professional tone with clear corrective action requirements</p>
                <p>• Token count: ~{aiAgentUtils.estimateTokenCount(generatedLetter)} tokens</p>
              </div>
            </div>
          ) : (
            <div className="glass-surface p-8 rounded-xl text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Complete the form to generate your professional violation letter
              </p>
              <p className="text-sm text-gray-500">
                Our AI agent will create a legally compliant, professionally formatted notice
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}