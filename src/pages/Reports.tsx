import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, TrendingUp } from 'lucide-react'

export const Reports: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">Monthly Reports</h1>
        <p className="text-gray-600 dark:text-gray-300">
          AI-generated reports with insights, trends, and performance metrics.
        </p>
      </motion.div>

      {/* Generate New Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Generate New Report</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create comprehensive monthly performance reports with AI insights
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">March 2024 Report</h3>
                <p className="text-gray-600 dark:text-gray-300">Generated 2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                View Report
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">February 2024 Report</h3>
                <p className="text-gray-600 dark:text-gray-300">Generated 1 month ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                View Report
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-6">Report Preview - March 2024</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-gradient mb-2">24</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Violations</div>
          </div>
          
          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-gradient mb-2">18</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Complaints Resolved</div>
          </div>
          
          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-gradient mb-2">2.4</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time (days)</div>
          </div>
          
          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-gradient mb-2">92%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Compliance Rate</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-surface p-6 rounded-xl">
            <h3 className="font-semibold mb-3">Key Insights</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Violation rates decreased by 15% compared to last month</li>
              <li>• Parking violations remain the most common issue (40% of total)</li>
              <li>• Average response time improved by 8 hours</li>
              <li>• Resident satisfaction score increased to 4.2/5</li>
            </ul>
          </div>

          <div className="glass-surface p-6 rounded-xl">
            <h3 className="font-semibold mb-3">AI Recommendations</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Consider sending a community reminder about parking policies</li>
              <li>• Schedule landscaping workshop to reduce lawn maintenance violations</li>
              <li>• Implement automated follow-up system for outstanding violations</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}