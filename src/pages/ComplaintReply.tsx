import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageCircle, AlertCircle } from 'lucide-react'
import { openAIService, type ComplaintData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const ComplaintReply: React.FC = () => {
  const [formData, setFormData] = useState({
    residentName: '',
    complaintCategory: '',
    complaintText: '',
    priorityLevel: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    previousComplaints: 0,
    managerName: '',
    relatedPolicies: '',
    expectedResolutionTime: '5-7 business days'
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResponse, setGeneratedResponse] = useState('')
  const [error, setError] = useState('')
  const { success, error: showError } = useToast()

  const complaintCategories = [
    'Maintenance & Repairs',
    'Neighbor Disputes',
    'Noise Complaints',
    'Parking Issues',
    'Amenity Concerns',
    'Policy Questions',
    'Financial Questions',
    'Landscaping Issues',
    'Security Concerns',
    'Communication Issues',
    'Board Decisions',
    'Other'
  ]

  const priorityLevels = ['Low', 'Medium', 'High', 'Urgent']

  const handleGenerate = async () => {
    if (!formData.residentName || !formData.complaintCategory || !formData.complaintText || !formData.managerName) {
      setError('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const complaintData: ComplaintData = {
        hoaName: 'Sunset Ridge Community HOA',
        residentName: formData.residentName,
        complaintCategory: formData.complaintCategory,
        complaintText: formData.complaintText,
        priorityLevel: formData.priorityLevel,
        previousComplaints: formData.previousComplaints,
        managerName: formData.managerName,
        dateReceived: new Date().toLocaleDateString(),
        relatedPolicies: formData.relatedPolicies || 'General Community Guidelines',
        resolutionTimeline: formData.expectedResolutionTime
      }

      const response = await openAIService.generateComplaintResponse(complaintData)
      setGeneratedResponse(response)
      success('Response Generated!', 'Professional complaint response created successfully')
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response'
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
        className="brutal-card p-8"
      >
        <h1 className="heading-2 mb-2">AI COMPLAINT RESPONSE GENERATOR</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate professional, empathetic responses to resident complaints and concerns.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="brutal-card p-6"
        >
          <h2 className="heading-3 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            COMPLAINT DETAILS
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Resident Name *</label>
              <input
                type="text"
                value={formData.residentName}
                onChange={(e) => setFormData(prev => ({ ...prev, residentName: e.target.value }))}
                className="input-liquid"
                placeholder="Enter resident's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Complaint Category *</label>
              <select
                value={formData.complaintCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, complaintCategory: e.target.value }))}
                className="input-liquid"
              >
                <option value="">Select complaint category</option>
                {complaintCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Complaint Text *</label>
              <textarea
                value={formData.complaintText}
                onChange={(e) => setFormData(prev => ({ ...prev, complaintText: e.target.value }))}
                className="input-liquid"
                rows={6}
                placeholder="Enter the resident's complaint or concern in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Priority Level</label>
                <select
                  value={formData.priorityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityLevel: e.target.value as any }))}
                  className="input-liquid"
                >
                  {priorityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Previous Complaints</label>
                <input
                  type="number"
                  value={formData.previousComplaints}
                  onChange={(e) => setFormData(prev => ({ ...prev, previousComplaints: parseInt(e.target.value) || 0 }))}
                  className="input-liquid"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Manager Name *</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                className="input-liquid"
                placeholder="Enter responding manager's name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Related Policies (Optional)</label>
              <input
                type="text"
                value={formData.relatedPolicies}
                onChange={(e) => setFormData(prev => ({ ...prev, relatedPolicies: e.target.value }))}
                className="input-liquid"
                placeholder="e.g., Section 4.2 - Parking Regulations"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Expected Resolution Time</label>
              <input
                type="text"
                value={formData.expectedResolutionTime}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedResolutionTime: e.target.value }))}
                className="input-liquid"
                placeholder="e.g., 5-7 business days"
              />
            </div>

            {error && (
              <div className="brutal-surface p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="loading-liquid"></div>
                  GENERATING RESPONSE...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  GENERATE AI RESPONSE
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Response Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="brutal-card p-6"
        >
          <h2 className="heading-3 mb-6">RESPONSE PREVIEW</h2>
          
          {generatedResponse ? (
            <div className="space-y-4">
              <div className="brutal-surface p-6 bg-white dark:bg-black border border-gray-300 dark:border-gray-600">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedResponse}
                </pre>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedResponse)}
                  className="btn-secondary flex-1"
                >
                  COPY RESPONSE
                </button>
                <button className="btn-primary flex-1">
                  SEND RESPONSE
                </button>
              </div>
            </div>
          ) : (
            <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Professional complaint response will appear here
              </p>
              <p className="text-sm text-gray-500">
                Fill out the complaint details and click "Generate AI Response"
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}