import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Clock, User, Mail, AlertCircle } from 'lucide-react'

const mockComplaints = {
  1: {
    id: 1,
    residentName: 'Sarah Johnson',
    email: 'sarah@email.com',
    subject: 'Noise complaint from neighboring unit',
    category: 'neighbor',
    priority: 'high',
    status: 'new',
    time: '2 hours ago',
    fullText: `Dear HOA Management,

I am writing to file a formal complaint about excessive noise coming from the unit next door (Unit 24B). For the past three weeks, there have been loud music and parties happening almost every night until 2-3 AM.

This is affecting my sleep and my family's well-being. I have spoken to the neighbor directly twice, but the noise continues.

I would appreciate your immediate intervention to resolve this matter.

Thank you for your attention to this serious issue.

Best regards,
Sarah Johnson
Unit 24A`
  },
  2: {
    id: 2,
    residentName: 'Mike Chen',
    email: 'mike@email.com',
    subject: 'Pool maintenance issue',
    category: 'maintenance',
    priority: 'medium',
    status: 'in_progress',
    time: '5 hours ago',
    fullText: `Hello,

The community pool has been closed for over a week now due to maintenance issues. However, there has been no communication about when it will reopen or what the specific problems are.

As residents who pay monthly fees that include pool maintenance, we deserve to know:
1. What is the exact issue?
2. When will repairs be completed?
3. Will there be any compensation for the extended closure?

I look forward to your prompt response.

Mike Chen
Unit 15C`
  },
  3: {
    id: 3,
    residentName: 'Lisa Williams',
    email: 'lisa@email.com',
    subject: 'Parking policy question',
    category: 'policy',
    priority: 'low',
    status: 'resolved',
    time: '1 day ago',
    fullText: `Hi there,

I have a question about the new parking regulations that were announced last month. The notice mentioned that guests can park in visitor spots for a maximum of 3 days, but I'm unclear about a few things:

1. Do I need to register guest vehicles?
2. What happens if all visitor spots are full?
3. Can guests park overnight in regular spots if they have permission?

Could you please clarify these points? I want to make sure I'm following the rules correctly.

Thank you,
Lisa Williams
Unit 8A`
  }
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  urgent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const complaint = mockComplaints[Number(id) as keyof typeof mockComplaints]
  
  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="heading-2 mb-4">Complaint Not Found</h1>
        <button onClick={() => navigate('/complaints')} className="btn-primary">
          Back to Complaints
        </button>
      </div>
    )
  }

  const handleReply = () => {
    navigate('/complaint-reply', { state: { complaint } })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/complaints')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints
        </button>
        <h1 className="heading-2">Complaint #{complaint.id}</h1>
      </motion.div>

      {/* Complaint Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="brutal-card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="heading-3 mb-2">{complaint.subject}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {complaint.residentName}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {complaint.email}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {complaint.time}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status as keyof typeof statusColors]}`}>
              {complaint.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
              {complaint.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>

        {/* Complaint Text */}
        <div className="brutal-surface p-6 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            COMPLAINT DETAILS
          </h3>
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {complaint.fullText}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={handleReply} className="btn-primary flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            GENERATE AI REPLY
          </button>
          <button className="btn-secondary">MARK AS RESOLVED</button>
          <button className="btn-secondary">ESCALATE TO BOARD</button>
        </div>
      </motion.div>

      {/* History/Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="brutal-card p-6"
      >
        <h3 className="heading-3 mb-4">COMPLAINT HISTORY</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 brutal-surface bg-gray-50 dark:bg-gray-800">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <div className="font-medium">Complaint Filed</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{complaint.time}</div>
              <div className="text-sm mt-1">Initial complaint received and assigned ID #{complaint.id}</div>
            </div>
          </div>
          
          {complaint.status === 'in_progress' && (
            <div className="flex items-start gap-4 p-4 brutal-surface bg-yellow-50 dark:bg-yellow-900/20">
              <Clock className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <div className="font-medium">Under Review</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">2 hours ago</div>
                <div className="text-sm mt-1">Complaint assigned to management team for investigation</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}