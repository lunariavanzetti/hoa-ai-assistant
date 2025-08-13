import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, 
  MessageCircle, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { paddleClient } from '@/lib/paddleClient'

const stats = [
  {
    name: 'Active Violations',
    value: '12',
    change: '+2 from last month',
    changeType: 'increase',
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    name: 'Open Complaints',
    value: '8',
    change: '-3 from last month',
    changeType: 'decrease',
    icon: MessageCircle,
    color: 'text-blue-400'
  },
  {
    name: 'Reports Generated',
    value: '24',
    change: '+12 from last month',
    changeType: 'increase',
    icon: FileText,
    color: 'text-green-400'
  },
  {
    name: 'Time Saved',
    value: '45hrs',
    change: '+15hrs from last month',
    changeType: 'increase',
    icon: Clock,
    color: 'text-purple-400'
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'violation',
    title: 'Lawn maintenance violation created',
    subtitle: '123 Oak Street',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    id: 2,
    type: 'complaint',
    title: 'Noise complaint resolved',
    subtitle: '456 Pine Avenue',
    time: '4 hours ago',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    id: 3,
    type: 'meeting',
    title: 'Board meeting summary generated',
    subtitle: 'March 2024 Meeting',
    time: '1 day ago',
    icon: Calendar,
    color: 'text-blue-400'
  },
  {
    id: 4,
    type: 'report',
    title: 'Monthly report completed',
    subtitle: 'February 2024',
    time: '2 days ago',
    icon: FileText,
    color: 'text-purple-400'
  }
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Initialize Paddle.js with customer data for in-app Retain notifications
  useEffect(() => {
    const initializePaddleWithUser = async () => {
      try {
        const paddle = await paddleClient.initialize()
        
        if (user?.email) {
          // Pass customer details to Paddle Retain for in-app notifications
          console.log('🔄 Initializing Paddle Retain with user:', user.email)
          
          // Initialize with customer data for Retain
          await paddle.Setup({
            pwCustomer: user.email, // Customer identifier for Retain
            customer: {
              email: user.email,
              id: user.id
            }
          })
          
          console.log('✅ Paddle Retain initialized with customer data')
        }
      } catch (error) {
        console.error('❌ Failed to initialize Paddle with user data:', error)
      }
    }
    
    if (user) {
      initializePaddleWithUser()
    }
  }, [user])

  const handleViewAll = () => {
    navigate('/violations')
  }

  const handleCreateViolation = () => {
    navigate('/violations')
  }

  const handleComplaint = () => {
    navigate('/complaint-reply')
  }

  const handleMeeting = () => {
    navigate('/meetings')
  }

  const handleReport = () => {
    navigate('/reports')
  }

  const handleUpgrade = () => {
    navigate('/pricing')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6 lg:p-8"
      >
        <h1 className="heading-2 text-xl sm:text-2xl lg:text-3xl mb-2">Welcome back! 👋</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Here's what's happening with your HOA today. You've saved 45 hours this month with AI automation.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card magnetic-hover p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
              <TrendingUp className={`w-4 h-4 ${
                stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">{stat.name}</p>
              <p className={`text-xs ${
                stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">Recent Activity</h2>
            <button onClick={handleViewAll} className="btn-secondary text-sm">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl glass-surface">
                <div className={`p-2 rounded-xl glass-surface ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium">{activity.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{activity.subtitle}</p>
                </div>
                <div className="text-xs text-gray-500 text-right whitespace-nowrap">{activity.time}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            <button onClick={handleCreateViolation} className="w-full btn-primary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Create Violation Letter
            </button>
            
            <button onClick={handleComplaint} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              Handle Complaint
            </button>
            
            <button onClick={handleMeeting} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              Upload Meeting Recording
            </button>
            
            <button onClick={handleReport} className="w-full btn-secondary text-left flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <FileText className="w-4 h-4 flex-shrink-0" />
              Generate Monthly Report
            </button>
          </div>

          {/* Usage Progress */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 glass-surface rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Monthly Usage
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Letters</span>
                  <span>7/10</span>
                </div>
                <div className="progress-liquid">
                  <div className="progress-fill" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Complaints</span>
                  <span>23/50</span>
                </div>
                <div className="progress-liquid">
                  <div className="progress-fill" style={{ width: '46%' }}></div>
                </div>
              </div>
            </div>
            
            <button onClick={handleUpgrade} className="w-full btn-primary mt-4 text-sm">
              Upgrade Plan
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4">AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">Trend Alert</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Parking violations have increased 40% this month. Consider sending a community reminder.
            </p>
          </div>
          
          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">Efficiency Tip</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Your response time improved by 60%. Residents appreciate the quick AI-powered responses.
            </p>
          </div>
          
          <div className="glass-surface p-3 sm:p-4 rounded-xl">
            <h3 className="text-sm sm:text-base font-semibold mb-2">Recommendation</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Consider scheduling a community meeting about landscaping guidelines based on recent violations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}