import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Mic, FileText, Calendar, Users, Clock, AlertCircle } from 'lucide-react'
import { openAIService, type MeetingData } from '@/lib/openai'
import { useToast } from '@/components/ui/Toaster'

export const MeetingSummary: React.FC = () => {
  const [formData, setFormData] = useState({
    meetingType: '',
    meetingDate: '',
    meetingTime: '',
    meetingLocation: '',
    transcriptContent: '',
    attendees: '',
    boardMembers: '',
    quorumMet: true,
    previousMinutesApproved: true,
    meetingDuration: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMinutes, setGeneratedMinutes] = useState('')
  const [error, setError] = useState('')
  const [_uploadedFileName, setUploadedFileName] = useState('')
  const { success, error: showError } = useToast()

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg']
      if (!allowedTypes.includes(file.type)) {
        showError('Invalid File Type', 'Please upload MP3, WAV, or M4A audio files only.')
        return
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showError('File Too Large', 'Audio file must be under 50MB.')
        return
      }
      
      setUploadedFileName(file.name)
      success('Audio Uploaded', 'Audio file uploaded. AI transcription coming soon!')
      // In a real app, you'd upload to storage and process with speech-to-text
    }
  }

  const handleTextUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        showError('Invalid File Type', 'Please upload TXT, PDF, DOC, or DOCX files only.')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError('File Too Large', 'Text file must be under 10MB.')
        return
      }
      
      // For text files, read the content
      if (file.type === 'text/plain') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setFormData(prev => ({ ...prev, transcriptContent: content }))
          success('Text Loaded', 'File content has been loaded into the transcript field.')
        }
        reader.readAsText(file)
      } else {
        setUploadedFileName(file.name)
        success('File Uploaded', 'Document uploaded. Text extraction coming soon!')
      }
    }
  }

  const meetingTypes = [
    'Regular Board Meeting',
    'Special Board Meeting',
    'Annual Homeowners Meeting',
    'Special Homeowners Meeting',
    'Committee Meeting',
    'Emergency Meeting',
    'Executive Session',
    'Budget Workshop',
    'Community Forum'
  ]

  const handleGenerate = async () => {
    if (!formData.meetingType || !formData.meetingDate || !formData.transcriptContent || !formData.boardMembers) {
      setError('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    setError('')
    
    try {
      const meetingData: MeetingData = {
        hoaName: 'Sunset Ridge Community HOA',
        meetingType: formData.meetingType,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime || '7:00 PM',
        meetingLocation: formData.meetingLocation || 'Community Center',
        transcriptContent: formData.transcriptContent,
        attendees: formData.attendees || 'See board members present',
        boardMembers: formData.boardMembers,
        quorumMet: formData.quorumMet,
        previousMinutesApproved: formData.previousMinutesApproved,
        meetingDuration: formData.meetingDuration || '2 hours'
      }

      const minutes = await openAIService.generateMeetingSummary(meetingData)
      setGeneratedMinutes(minutes)
      success('Meeting Minutes Generated!', 'Official meeting minutes created successfully')
    } catch (error) {
      console.error('Error generating minutes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate meeting minutes'
      setError(errorMessage)
      showError('Generation Failed', errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    // Create a simple PDF-like text format for download
    const content = `MEETING MINUTES - ${formData.meetingDate}\n\n${generatedMinutes}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-minutes-${formData.meetingDate || 'draft'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    success('Download Started', 'Meeting minutes downloaded as text file')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-4 sm:p-6 lg:p-8"
      >
        <h1 className="heading-2 text-xl sm:text-2xl lg:text-3xl mb-2">AI MEETING MINUTES GENERATOR</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Generate legally compliant, comprehensive meeting minutes from transcripts with expert parliamentary procedure.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Meeting Details */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              MEETING DETAILS
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Meeting Type *</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingType: e.target.value }))}
                  className="input-liquid"
                >
                  <option value="">Select meeting type</option>
                  {meetingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">Meeting Date *</label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                    className="input-liquid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">Meeting Time</label>
                  <input
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                    className="input-liquid"
                    placeholder="7:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Location/Platform</label>
                <input
                  type="text"
                  value={formData.meetingLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLocation: e.target.value }))}
                  className="input-liquid"
                  placeholder="Community Center / Zoom / Teams"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Meeting Duration</label>
                <input
                  type="text"
                  value={formData.meetingDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingDuration: e.target.value }))}
                  className="input-liquid"
                  placeholder="e.g., 2 hours, 1.5 hours"
                />
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              ATTENDANCE
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Board Members Present *</label>
                <textarea
                  value={formData.boardMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, boardMembers: e.target.value }))}
                  className="input-liquid"
                  rows={3}
                  placeholder="List board members present: John Smith (President), Jane Doe (Secretary), etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase">Other Attendees</label>
                <textarea
                  value={formData.attendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                  className="input-liquid"
                  rows={2}
                  placeholder="Management company reps, homeowners, legal counsel, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="quorum"
                    checked={formData.quorumMet}
                    onChange={(e) => setFormData(prev => ({ ...prev, quorumMet: e.target.checked }))}
                    className="w-5 h-5 text-brutal-electric bg-white border-3 border-black focus:ring-brutal-electric focus:ring-2"
                  />
                  <label htmlFor="quorum" className="text-sm font-bold uppercase">
                    Quorum Met
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="minutes"
                    checked={formData.previousMinutesApproved}
                    onChange={(e) => setFormData(prev => ({ ...prev, previousMinutesApproved: e.target.checked }))}
                    className="w-5 h-5 text-brutal-electric bg-white border-3 border-black focus:ring-brutal-electric focus:ring-2"
                  />
                  <label htmlFor="minutes" className="text-sm font-bold uppercase">
                    Previous Minutes Approved
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="brutal-card p-6">
            <h2 className="heading-3 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              TRANSCRIPT
            </h2>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase">Meeting Transcript/Recording Content *</label>
              <textarea
                value={formData.transcriptContent}
                onChange={(e) => setFormData(prev => ({ ...prev, transcriptContent: e.target.value }))}
                className="input-liquid"
                rows={8}
                placeholder="Paste the meeting transcript, notes, or key discussion points here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Include all discussions, motions, votes, and decisions made during the meeting
              </p>
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
                  GENERATING MINUTES...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  GENERATE OFFICIAL MINUTES
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Minutes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="brutal-card p-6"
        >
          <h2 className="heading-3 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            OFFICIAL MEETING MINUTES
          </h2>
          
          {generatedMinutes ? (
            <div className="space-y-4">
              <div className="brutal-surface p-6 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedMinutes}
                </pre>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedMinutes)}
                  className="btn-secondary flex-1"
                >
                  COPY MINUTES
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="btn-primary flex-1"
                >
                  DOWNLOAD PDF
                </button>
              </div>

              <div className="brutal-surface p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Legal Notice:</strong> These AI-generated minutes should be reviewed by the board secretary 
                  and approved by the board before becoming official records.
                </p>
              </div>
            </div>
          ) : (
            <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Official meeting minutes will appear here
              </p>
              <p className="text-sm text-gray-500">
                Fill out the meeting details and transcript, then click "Generate Official Minutes"
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card p-8"
      >
        <h2 className="heading-3 mb-6">AUDIO TRANSCRIPT UPLOAD</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
            <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Audio Recording</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload meeting audio files (MP3, WAV, M4A)
            </p>
            <label className="btn-secondary cursor-pointer inline-flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              UPLOAD AUDIO
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="brutal-surface p-8 text-center bg-gray-50 dark:bg-gray-800">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2 uppercase">Text Transcript</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload existing transcripts or documents
            </p>
            <label className="btn-secondary cursor-pointer inline-flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              UPLOAD TEXT
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleTextUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}