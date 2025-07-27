import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const toastColors = {
  success: 'from-green-500 to-emerald-500',
  error: 'from-red-500 to-rose-500',
  info: 'from-blue-500 to-indigo-500',
  warning: 'from-yellow-500 to-orange-500'
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type]
  const colorClass = toastColors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden"
    >
      <div className="glass-card p-4 max-w-sm w-full relative">
        {/* Gradient border */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClass} opacity-20`} />
        
        <div className="relative flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 text-${toast.type === 'success' ? 'green' : toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : 'blue'}-400`} />
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {toast.description}
              </p>
            )}
          </div>
          
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }, [removeToast])

  const toast = useCallback((toast: Omit<Toast, 'id'>) => addToast(toast), [addToast])
  const success = useCallback((title: string, description?: string) => addToast({ type: 'success', title, description }), [addToast])
  const error = useCallback((title: string, description?: string) => addToast({ type: 'error', title, description }), [addToast])
  const info = useCallback((title: string, description?: string) => addToast({ type: 'info', title, description }), [addToast])
  const warning = useCallback((title: string, description?: string) => addToast({ type: 'warning', title, description }), [addToast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// Main Toaster component to be used in App
export const Toaster: React.FC = () => {
  return <ToastProvider><></></ToastProvider>
}