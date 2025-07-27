import React from 'react'
import { motion } from 'framer-motion'
import { Upload, Mic, FileText, Calendar } from 'lucide-react'

export const MeetingSummary: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">Meeting Summaries</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Upload recordings or transcripts to generate AI-powered meeting summaries and action items.
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <h2 className="text-xl font-bold mb-6">Upload New Meeting</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center glass-surface">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Audio Recording</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload meeting audio files (MP3, WAV, M4A)
            </p>
            <button className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center glass-surface">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Text Transcript</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload or paste meeting transcripts
            </p>
            <button className="btn-secondary">
              <Upload className="w-4 h-4 mr-2" />
              Upload Text
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recent Meeting Summaries</h2>
          <button className="btn-secondary">View All</button>
        </div>

        <div className="space-y-4">
          {/* Meeting Item */}
          <div className="glass-surface p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">March 2024 Board Meeting</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">March 15, 2024 • 2 hours • 8 attendees</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">Budget approved for pool renovation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-sm">New parking policy to be drafted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-sm">Next meeting scheduled for April 19th</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn-secondary text-sm">View Summary</button>
                <button className="btn-primary text-sm">Download PDF</button>
              </div>
            </div>
          </div>

          {/* Another Meeting Item */}
          <div className="glass-surface p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Annual Homeowners Meeting</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">February 28, 2024 • 3 hours • 45 attendees</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">Annual budget presentation completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">Board members re-elected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span className="text-sm">Community garden proposal under review</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn-secondary text-sm">View Summary</button>
                <button className="btn-primary text-sm">Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">AI-Powered Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Auto Transcription</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Convert audio recordings to text automatically
            </p>
          </div>

          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Smart Summaries</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Generate concise meeting minutes and key decisions
            </p>
          </div>

          <div className="glass-surface p-4 rounded-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Action Items</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automatically extract and track action items
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}