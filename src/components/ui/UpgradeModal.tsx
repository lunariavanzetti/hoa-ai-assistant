import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Star, ArrowRight, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  title: string
  description: string
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  title,
  description
}) => {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    navigate('/pricing')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upgrade Required
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {description}
              </p>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  You've reached your monthly limit for {feature}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Unlimited {feature.toLowerCase()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Advanced AI templates</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <Star className="w-3 h-3 text-green-600 dark:text-green-400 fill-current" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Export capabilities</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
              
              <button
                onClick={handleUpgrade}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                Upgrade Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pricing hint */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Starting from just $9/month • Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}