import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="relative">
      <button
        onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-pointer text-white/70 hover:text-white"
      >
        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="text-xs sm:text-sm font-medium">
          {language === 'en' ? 'RU' : 'EN'}
        </span>
      </button>
    </div>
  )
}