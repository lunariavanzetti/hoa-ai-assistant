import React, { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDark(shouldBeDark)
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-500 ease-in-out
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }
        backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-white/30
        transform hover:scale-105 active:scale-95
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div
        className={`
          absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-in-out
          transform ${isDark ? 'translate-x-8 rotate-180' : 'translate-x-1 rotate-0'}
          backdrop-blur-sm border border-white/30
          ${isDark 
            ? 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-lg' 
            : 'bg-gradient-to-r from-white to-yellow-100 shadow-md'
          }
          flex items-center justify-center
        `}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-blue-300" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-600" />
        )}
      </div>
      
      {/* Ambient glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-full opacity-50 blur-md transition-all duration-500 -z-10
          ${isDark 
            ? 'bg-gradient-to-r from-indigo-400 to-purple-400' 
            : 'bg-gradient-to-r from-yellow-300 to-orange-400'
          }
        `}
      />
    </button>
  )
}