import React from 'react'
import { motion } from 'framer-motion'
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
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="heading-2 mb-2">Welcome back! 👋</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening with your HOA today. You've saved 45 hours this month with AI automation.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card magnetic-hover p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <TrendingUp className={`w-4 h-4 ${
                stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{stat.name}</p>
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
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <button className="btn-secondary text-sm">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 rounded-xl glass-surface">
                <div className={`p-2 rounded-xl glass-surface ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activity.subtitle}</p>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            <button className="w-full btn-primary text-left flex items-center gap-3">
              <AlertTriangle className="w-4 h-4" />
              Create Violation Letter
            </button>
            
            <button className="w-full btn-secondary text-left flex items-center gap-3">
              <MessageCircle className="w-4 h-4" />
              Handle Complaint
            </button>
            
            <button className="w-full btn-secondary text-left flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              Upload Meeting Recording
            </button>
            
            <button className="w-full btn-secondary text-left flex items-center gap-3">
              <FileText className="w-4 h-4" />
              Generate Monthly Report
            </button>
          </div>

          {/* Usage Progress */}
          <div className="mt-8 p-4 glass-surface rounded-xl">
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
            
            <button className="w-full btn-primary mt-4 text-sm">
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
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4">AI Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-surface p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Trend Alert</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Parking violations have increased 40% this month. Consider sending a community reminder.
            </p>
          </div>
          
          <div className="glass-surface p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Efficiency Tip</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your response time improved by 60%. Residents appreciate the quick AI-powered responses.
            </p>
          </div>
          
          <div className="glass-surface p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Recommendation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Consider scheduling a community meeting about landscaping guidelines based on recent violations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}