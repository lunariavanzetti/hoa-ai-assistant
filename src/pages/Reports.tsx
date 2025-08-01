import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, BarChart3, Building2, DollarSign, AlertCircle, Calendar } from 'lucide-react'
import { openAIService, type MonthlyReportData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const Reports: React.FC = () => {
  const [formData, setFormData] = useState({
    reportPeriod: '',
    totalUnits: 150,
    occupiedUnits: 142,
    boardMembers: '',
    managementCompany: 'Sunset Ridge Management',
    violationsData: '',
    complaintsData: '',
    financialData: '',
    maintenanceData: '',
    meetingData: '',
    complianceData: '',
    communityEvents: '',
    vendorData: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState('')
  const [error, setError] = useState('')
  const { success, error: showError } = useToast()

  const handleGenerate = async () => {
    if (!formData.reportPeriod || !formData.boardMembers) {
      setError('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const reportData: MonthlyReportData = {
        hoaName: 'Sunset Ridge Community HOA',
        reportPeriod: formData.reportPeriod,
        totalUnits: formData.totalUnits,
        occupiedUnits: formData.occupiedUnits,
        boardMembers: formData.boardMembers,
        managementCompany: formData.managementCompany,
        violationsData: formData.violationsData || 'No violations data provided for this period',
        complaintsData: formData.complaintsData || 'No complaints data provided for this period',
        financialData: formData.financialData || 'Financial data not provided',
        maintenanceData: formData.maintenanceData || 'Maintenance data not provided',
        meetingData: formData.meetingData || 'Meeting data not provided',
        complianceData: formData.complianceData || 'Compliance data not provided',
        communityEvents: formData.communityEvents || 'No community events for this period',
        vendorData: formData.vendorData || 'Vendor performance data not provided'
      }

      const report = await openAIService.generateMonthlyReport(reportData)
      setGeneratedReport(report)
      success('Monthly Report Generated!', 'Comprehensive performance analysis created successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate monthly report'
      setError(errorMessage)
      showError('Generation Failed', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    // Create a downloadable text file with the report
    const content = `MONTHLY REPORT - ${formData.reportPeriod}\n\n${generatedReport}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly-report-${formData.reportPeriod || 'draft'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Download Started', 'Monthly report downloaded as text file')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-8"
      >
        <h1 className="heading-2 mb-2">AI MONTHLY REPORTS GENERATOR</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate comprehensive executive-level monthly performance reports with advanced analytics and strategic insights.
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
          {/* Basic Info */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              REPORT DETAILS
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Report Period *</label>
                <input
                  type="month"
                  value={formData.reportPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportPeriod: e.target.value }))}
                  className="input-liquid"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">Total Units</label>
                  <input
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                    className="input-liquid"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">Occupied Units</label>
                  <input
                    type="number"
                    value={formData.occupiedUnits}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupiedUnits: parseInt(e.target.value) || 0 }))}
                    className="input-liquid"
                    min="0"
                    max={formData.totalUnits}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Board Members *</label>
                <textarea
                  value={formData.boardMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, boardMembers: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="List current board members: President, Secretary, Treasurer, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Management Company</label>
                <input
                  type="text"
                  value={formData.managementCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, managementCompany: e.target.value }))}
                  className="input-liquid"
                  placeholder="Management company name"
                />
              </div>
            </div>
          </div>

          {/* Data Inputs */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              OPERATIONAL DATA
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Violations Data</label>
                <textarea
                  value={formData.violationsData}
                  onChange={(e) => setFormData(prev => ({ ...prev, violationsData: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Total violations, categories, resolution rates, compliance metrics..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Complaints Data</label>
                <textarea
                  value={formData.complaintsData}
                  onChange={(e) => setFormData(prev => ({ ...prev, complaintsData: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Total complaints, categories, response times, resolution rates..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Financial Data</label>
                <textarea
                  value={formData.financialData}
                  onChange={(e) => setFormData(prev => ({ ...prev, financialData: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Collections, expenses, reserves, budget variances..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Maintenance Data</label>
                <textarea
                  value={formData.maintenanceData}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenanceData: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Work orders, completion times, costs, vendor performance..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Meeting Data</label>
                <textarea
                  value={formData.meetingData}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingData: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Board meetings held, attendance, decisions made..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Community Events</label>
                <textarea
                  value={formData.communityEvents}
                  onChange={(e) => setFormData(prev => ({ ...prev, communityEvents: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Events held, attendance, resident engagement..."
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
                  GENERATING REPORT...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  GENERATE MONTHLY REPORT
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Report */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              EXECUTIVE MONTHLY REPORT
            </h2>
            
            {generatedReport ? (
              <div className="space-y-4">
                <div className="brutal-surface p-6 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedReport}
                  </pre>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedReport)}
                    className="btn-secondary flex-1"
                  >
                    COPY REPORT
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="btn-primary flex-1"
                  >
                    DOWNLOAD PDF
                  </button>
                </div>

                <div className="brutal-surface p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Executive Report:</strong> This comprehensive analysis includes operational metrics, 
                    financial performance, strategic recommendations, and forward-looking insights for board review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Executive monthly report will appear here
                </p>
                <p className="text-sm text-gray-500">
                  Fill out the report details and operational data, then click "Generate Monthly Report"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Report Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card p-8"
      >
        <h2 className="heading-3 mb-6">COMPREHENSIVE REPORT SECTIONS</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Executive Summary</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              C-level overview with KPIs, accomplishments, and strategic priorities
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Operational Metrics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Violations, complaints, communication effectiveness dashboard
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Financial Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Revenue, expenses, reserves, and budget performance analysis
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Forward Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Trends, strategic recommendations, and next month outlook
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}