import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toaster'

const complaints = [
  {
    id: 1,
    residentName: 'Sarah Johnson',
    email: 'sarah@email.com',
    subject: 'Noise complaint from neighboring unit',
    category: 'neighbor',
    priority: 'high',
    status: 'new',
    time: '2 hours ago',
    preview: 'The unit next door has been playing loud music until very late...'
  },
  {
    id: 2,
    residentName: 'Mike Chen',
    email: 'mike@email.com',
    subject: 'Pool maintenance issue',
    category: 'maintenance',
    priority: 'medium',
    status: 'in_progress',
    time: '5 hours ago',
    preview: 'The pool area has been closed for over a week now...'
  },
  {
    id: 3,
    residentName: 'Lisa Williams',
    email: 'lisa@email.com',
    subject: 'Parking policy question',
    category: 'policy',
    priority: 'low',
    status: 'resolved',
    time: '1 day ago',
    preview: 'I have a question about the new parking regulations...'
  }
]

const statusColors = {
  new: 'text-blue-400',
  in_progress: 'text-yellow-400',
  resolved: 'text-green-400',
  closed: 'text-gray-400'
}

const statusIcons = {
  new: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: CheckCircle
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  urgent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
}

export const ComplaintInbox: React.FC = () => {
  const navigate = useNavigate()
  const { success } = useToast()

  const handleNewComplaint = () => {
    navigate('/complaint-reply')
  }

  const handleViewComplaint = (complaintId: number) => {
    navigate(`/complaints/${complaintId}`)
  }

  const handleReplyToComplaint = (complaintId: number) => {
    navigate('/complaint-reply')
    success('Reply Mode', `Preparing reply for complaint #${complaintId}`)
  }

  const handleViewTemplates = () => {
    success('Templates', 'AI response templates are being loaded...')
  }

  const handleReviewAlerts = () => {
    success('Alerts', 'Reviewing 2 priority complaints...')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">Complaint Inbox</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage resident complaints with AI-powered response suggestions.
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-wrap gap-4">
          <select className="input-liquid">
            <option>All Status</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          
          <select className="input-liquid">
            <option>All Categories</option>
            <option>Maintenance</option>
            <option>Neighbor</option>
            <option>Policy</option>
            <option>Amenity</option>
          </select>
          
          <select className="input-liquid">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          
          <button onClick={handleNewComplaint} className="btn-primary">
            <MessageCircle className="w-4 h-4 mr-2" />
            New Complaint
          </button>
        </div>
      </motion.div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((complaint, index) => {
          const StatusIcon = statusIcons[complaint.status as keyof typeof statusIcons]
          
          return (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-card p-6 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-xl glass-surface ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span>{complaint.residentName}</span>
                      <span>{complaint.email}</span>
                      <span className="capitalize">{complaint.category}</span>
                      <span>{complaint.time}</span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300">{complaint.preview}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleViewComplaint(complaint.id)} className="btn-secondary text-sm">View</button>
                  <button onClick={() => handleReplyToComplaint(complaint.id)} className="btn-primary text-sm">Reply</button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">AI Response Suggestions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-surface p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Quick Response Templates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              AI has generated response templates based on complaint patterns.
            </p>
            <button onClick={handleViewTemplates} className="btn-secondary text-sm">View Templates</button>
          </div>
          
          <div className="glass-surface p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Escalation Alerts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              2 complaints require immediate attention based on priority scoring.
            </p>
            <button onClick={handleReviewAlerts} className="btn-primary text-sm">Review Alerts</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}