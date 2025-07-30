import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Activity, DollarSign, Eye, Server, Lock, BarChart3 } from 'lucide-react'
import { openAIService, type DataMonitorData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const DataMonitor: React.FC = () => {
  const [formData, setFormData] = useState({
    monitoringPeriod: '',
    usageMetrics: '',
    securityIncidents: '',
    financialAnomalies: '',
    userBehaviorPatterns: '',
    systemPerformance: '',
    complianceStatus: '',
    threatLevel: 'LOW',
    alertsGenerated: '',
    actionsTaken: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAnalysis, setGeneratedAnalysis] = useState('')
  const [error, setError] = useState('')
  const { success, error: showError } = useToast()

  const threatLevels = [
    { value: 'LOW', label: 'Level 1 - Low', color: 'text-green-600' },
    { value: 'MODERATE', label: 'Level 2 - Moderate', color: 'text-yellow-600' },
    { value: 'ELEVATED', label: 'Level 3 - Elevated', color: 'text-orange-600' },
    { value: 'HIGH', label: 'Level 4 - High', color: 'text-red-600' },
    { value: 'CRITICAL', label: 'Level 5 - Critical', color: 'text-red-800' }
  ]

  const handleGenerate = async () => {
    if (!formData.monitoringPeriod || !formData.usageMetrics) {
      setError('Please fill in monitoring period and usage metrics')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const monitorData: DataMonitorData = {
        hoaName: 'Sunset Ridge Community HOA',
        monitoringPeriod: formData.monitoringPeriod,
        usageMetrics: formData.usageMetrics,
        securityIncidents: formData.securityIncidents || 'No security incidents reported for this period',
        financialAnomalies: formData.financialAnomalies || 'No financial anomalies detected',
        userBehaviorPatterns: formData.userBehaviorPatterns || 'Standard user behavior patterns observed',
        systemPerformance: formData.systemPerformance || 'System operating within normal parameters',
        complianceStatus: formData.complianceStatus || 'All compliance requirements met',
        threatLevel: formData.threatLevel,
        alertsGenerated: formData.alertsGenerated || 'No alerts generated during monitoring period',
        actionsTaken: formData.actionsTaken || 'No immediate actions required'
      }

      const analysis = await openAIService.generateSecurityAnalysis(monitorData)
      setGeneratedAnalysis(analysis)
      success('Security Analysis Generated!', 'Comprehensive cybersecurity report created successfully')
    } catch (error) {
      console.error('Error generating analysis:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate security analysis'
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
        <h1 className="heading-2 mb-2">AI CYBERSECURITY MONITOR</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Advanced threat detection, fraud monitoring, and security analysis with real-time platform protection.
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
          {/* Monitoring Period */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              MONITORING OVERVIEW
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Monitoring Period *</label>
                <input
                  type="month"
                  value={formData.monitoringPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, monitoringPeriod: e.target.value }))}
                  className="input-liquid"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Current Threat Level</label>
                <select
                  value={formData.threatLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, threatLevel: e.target.value }))}
                  className="input-liquid"
                >
                  {threatLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Usage Metrics *</label>
                <textarea
                  value={formData.usageMetrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageMetrics: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="API calls, user sessions, document generations, system load..."
                />
              </div>
            </div>
          </div>

          {/* Security Data */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              SECURITY INTELLIGENCE
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Security Incidents</label>
                <textarea
                  value={formData.securityIncidents}
                  onChange={(e) => setFormData(prev => ({ ...prev, securityIncidents: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Failed logins, suspicious IPs, unauthorized access attempts..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">User Behavior Patterns</label>
                <textarea
                  value={formData.userBehaviorPatterns}
                  onChange={(e) => setFormData(prev => ({ ...prev, userBehaviorPatterns: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="Login patterns, feature usage, geographic access, session durations..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">System Performance</label>
                <textarea
                  value={formData.systemPerformance}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemPerformance: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Response times, error rates, uptime, resource utilization..."
                />
              </div>
            </div>
          </div>

          {/* Financial & Compliance */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              FINANCIAL & COMPLIANCE
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Financial Anomalies</label>
                <textarea
                  value={formData.financialAnomalies}
                  onChange={(e) => setFormData(prev => ({ ...prev, financialAnomalies: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Billing irregularities, subscription abuse, payment fraud..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Compliance Status</label>
                <textarea
                  value={formData.complianceStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, complianceStatus: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="GDPR, SOC2, data retention, privacy policy adherence..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Alerts Generated</label>
                <textarea
                  value={formData.alertsGenerated}
                  onChange={(e) => setFormData(prev => ({ ...prev, alertsGenerated: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Automated alerts, threshold breaches, security notifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Actions Taken</label>
                <textarea
                  value={formData.actionsTaken}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionsTaken: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Security measures deployed, accounts suspended, patches applied..."
                />
              </div>
            </div>

            {error && (
              <div className="brutal-surface p-4 border border-red-500 bg-red-50 dark:bg-red-900/20 mt-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
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
                  ANALYZING THREATS...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  GENERATE SECURITY ANALYSIS
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              CYBERSECURITY ANALYSIS REPORT
            </h2>
            
            {generatedAnalysis ? (
              <div className="space-y-4">
                <div className="brutal-surface p-6 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedAnalysis}
                  </pre>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedAnalysis)}
                    className="btn-secondary flex-1"
                  >
                    COPY ANALYSIS
                  </button>
                  <button className="btn-primary flex-1">
                    EXPORT REPORT
                  </button>
                </div>

                <div className="brutal-surface p-4 bg-red-50 dark:bg-red-900/20 border border-red-300">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Security Notice:</strong> This analysis contains sensitive security information. 
                    Distribute only to authorized personnel with appropriate security clearance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Cybersecurity analysis report will appear here
                </p>
                <p className="text-sm text-gray-500">
                  Fill out the monitoring data and threat intelligence, then click "Generate Security Analysis"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Security Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card p-8"
      >
        <h2 className="heading-3 mb-6">SECURITY MONITORING CAPABILITIES</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Threat Detection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time monitoring for security breaches, unauthorized access, and system vulnerabilities
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Fraud Prevention</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Advanced billing fraud detection, subscription abuse monitoring, and revenue protection
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">System Health</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Performance monitoring, capacity planning, and operational health dashboards
            </p>
          </div>

          <div className="brutal-surface p-6 text-center bg-gray-50 dark:bg-gray-800">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Compliance Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              GDPR, SOC2, and regulatory compliance monitoring with automated reporting
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}