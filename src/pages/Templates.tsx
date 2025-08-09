import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Mail, Calendar, Building } from 'lucide-react'

export const Templates: React.FC = () => {
  const [email, setEmail] = useState('')
  const [downloadedTemplates, setDownloadedTemplates] = useState<string[]>([])

  const templates = [
    {
      id: 'violation-letter',
      title: 'HOA Violation Letter Template',
      description: 'Professional, legally-compliant violation notice template with customizable sections.',
      icon: FileText,
      category: 'Legal Documents',
      downloads: 2847,
      preview: 'View comprehensive violation letter format with legal language and required disclosures.'
    },
    {
      id: 'complaint-response',
      title: 'Complaint Response Template',
      description: 'Professional responses to common resident complaints with de-escalation language.',
      icon: Mail,
      category: 'Communications',
      downloads: 1923,
      preview: 'Structured responses for noise, parking, maintenance, and neighbor disputes.'
    },
    {
      id: 'meeting-minutes',
      title: 'Board Meeting Minutes Template',
      description: 'Official meeting minutes format with action items and voting records.',
      icon: Calendar,
      category: 'Governance',
      downloads: 1654,
      preview: 'Complete meeting documentation with attendance, motions, and follow-ups.'
    },
    {
      id: 'architectural-request',
      title: 'Architectural Request Form',
      description: 'Standardized form for residents requesting property modifications.',
      icon: Building,
      category: 'Forms',
      downloads: 1432,
      preview: 'Detailed request form with approval criteria and submission requirements.'
    }
  ]

  const handleDownload = (templateId: string) => {
    if (!email) {
      alert('Please enter your email to download templates')
      return
    }

    // Simulate download tracking
    setDownloadedTemplates(prev => [...prev, templateId])
    
    // In real implementation, you'd:
    // 1. Save email to your mailing list
    // 2. Track download analytics
    // 3. Send actual PDF file
    
    alert(`Template downloading! Check your email at ${email}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="heading-1 mb-4">Free HOA Templates</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Professional templates used by 1,000+ HOA managers. Download instantly and customize for your community.
          </p>
          
          {/* Email Capture */}
          <div className="max-w-md mx-auto flex gap-3 mb-8">
            <input
              type="email"
              placeholder="Enter your email for instant download"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ⚡ Instant download • 📧 No spam • 🔒 Unsubscribe anytime
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <template.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.downloads.toLocaleString()} downloads
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {template.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {template.preview}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleDownload(template.id)}
                disabled={downloadedTemplates.includes(template.id)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  downloadedTemplates.includes(template.id)
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'btn-primary'
                }`}
              >
                <Download className="w-4 h-4" />
                {downloadedTemplates.includes(template.id) ? 'Downloaded!' : 'Download Free Template'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">
            Want These Generated Automatically?
          </h2>
          <p className="text-lg mb-6 text-indigo-100">
            Stop filling out templates manually. Our AI generates professional HOA documents in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Try AI Generator Free
            </button>
            <button className="border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}