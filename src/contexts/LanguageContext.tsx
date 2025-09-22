import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ru'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Header
    'header.kateriss': 'Kateriss',
    'header.signin': 'Sign in',
    'header.logout': 'Logout',
    'header.tokens': 'tokens',
    'header.plan': 'plan',

    // Dashboard
    'dashboard.title': 'Create AI Video',
    'dashboard.subtitle': 'Describe your idea and generate stunning videos',
    'dashboard.placeholder': 'Describe your video idea...',
    'dashboard.noTokens': 'You have 0 tokens. Select a plan to start generating videos.',
    'dashboard.buyTokens': 'Buy Tokens',
    'dashboard.generatedVideos': 'Generated Videos',
    'dashboard.generating': 'Generating...',

    // Navigation
    'nav.templates': 'Templates',
    'nav.history': 'History',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.videos': 'My Videos',

    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Select the perfect plan for your AI video generation needs.',
    'pricing.payPerVideo': 'Pay-per-Video',
    'pricing.basicMonthly': 'Basic Monthly',
    'pricing.premiumMonthly': 'Premium Monthly',
    'pricing.generate2Videos': 'Generate 2 videos',
    'pricing.videosPerMonth': 'videos per month',
    'pricing.getStarted': 'Get Started',
    'pricing.processing': 'Processing...',
    'pricing.tokens': 'tokens',
    'pricing.mostPopular': 'Most Popular',
    'pricing.features.hdQuality': 'HD quality output',
    'pricing.features.formats': 'Horizontal & vertical formats',
    'pricing.features.priority': 'Priority processing',
    'pricing.features.earlyAccess': 'Early access to new features',

    // Landing
    'landing.title': 'Create videos with',
    'landing.titleAccent': 'AI magic',
    'landing.subtitle': 'Turn your ideas into stunning videos in minutes. No experience needed.',
    'landing.startCreating': 'Start creating',
    'landing.feature1.title': 'Type your idea',
    'landing.feature1.description': 'Describe what you want in simple words. Our AI understands your vision.',
    'landing.feature2.title': 'AI creates',
    'landing.feature2.description': 'Watch as advanced AI brings your vision to life with stunning visuals.',
    'landing.feature3.title': 'Share anywhere',
    'landing.feature3.description': 'Download in high quality and share your masterpiece across all platforms.',

    // Auth
    'auth.welcomeBack': 'Welcome Back',
    'auth.createAccount': 'Create Account',
    'auth.signInDescription': 'Sign in to your Kateriss account',
    'auth.createDescription': 'Join thousands of HOA managers saving time with AI',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.continueWithApple': 'Continue with Apple',
    'auth.or': 'or',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.enterFullName': 'Enter your full name',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.signIn': 'Sign In',
    'auth.backToHome': 'Back to home',

    // Video History
    'videos.title': 'My Videos',
    'videos.subtitle': 'Manage and download your generated videos',
    'videos.search': 'Search videos...',
    'videos.processing': 'Processing...',
    'videos.failed': 'Generation Failed',
    'videos.download': 'Download',
    'videos.preview': 'Preview',
    'videos.retry': 'Retry Generation',
    'videos.delete': 'Delete',
    'videos.prompt': 'Prompt:',

    // Orientations
    'orientation.horizontal': '16:9',
    'orientation.vertical': '9:16',

    // Common
    'common.free': 'free',
    'common.premium': 'premium',
    'common.basic': 'basic',
    'common.month': 'month'
  },
  ru: {
    // Header
    'header.kateriss': 'Kateriss',
    'header.signin': 'Войти',
    'header.logout': 'Выйти',
    'header.tokens': 'токенов',
    'header.plan': 'план',

    // Dashboard
    'dashboard.title': 'Создать ИИ Видео',
    'dashboard.subtitle': 'Опишите свою идею и создайте потрясающие видео',
    'dashboard.placeholder': 'Опишите идею вашего видео...',
    'dashboard.noTokens': 'У вас 0 токенов. Выберите план, чтобы начать создавать видео.',
    'dashboard.buyTokens': 'Купить Токены',
    'dashboard.generatedVideos': 'Созданные Видео',
    'dashboard.generating': 'Создание...',

    // Navigation
    'nav.templates': 'Шаблоны',
    'nav.history': 'История',
    'nav.analytics': 'Аналитика',
    'nav.settings': 'Настройки',
    'nav.videos': 'Мои Видео',

    // Pricing
    'pricing.title': 'Выберите Тарифный План',
    'pricing.subtitle': 'Выберите идеальный план для создания ИИ видео.',
    'pricing.payPerVideo': 'Плата за Видео',
    'pricing.basicMonthly': 'Базовый Месячный',
    'pricing.premiumMonthly': 'Премиум Месячный',
    'pricing.generate2Videos': 'Создать 2 видео',
    'pricing.videosPerMonth': 'видео в месяц',
    'pricing.getStarted': 'Начать',
    'pricing.processing': 'Обработка...',
    'pricing.tokens': 'токенов',
    'pricing.mostPopular': 'Самый Популярный',
    'pricing.features.hdQuality': 'HD качество вывода',
    'pricing.features.formats': 'Горизонтальный и вертикальный форматы',
    'pricing.features.priority': 'Приоритетная обработка',
    'pricing.features.earlyAccess': 'Ранний доступ к новым функциям',

    // Landing
    'landing.title': 'Создавайте видео с помощью',
    'landing.titleAccent': 'магии ИИ',
    'landing.subtitle': 'Превратите свои идеи в потрясающие видео за минуты. Опыт не нужен.',
    'landing.startCreating': 'Начать создавать',
    'landing.feature1.title': 'Введите свою идею',
    'landing.feature1.description': 'Опишите то, что хотите, простыми словами. Наш ИИ понимает ваше видение.',
    'landing.feature2.title': 'ИИ создает',
    'landing.feature2.description': 'Смотрите, как продвинутый ИИ воплощает ваше видение в потрясающих визуалах.',
    'landing.feature3.title': 'Делитесь везде',
    'landing.feature3.description': 'Скачивайте в высоком качестве и делитесь шедевром на всех платформах.',

    // Auth
    'auth.welcomeBack': 'Добро Пожаловать',
    'auth.createAccount': 'Создать Аккаунт',
    'auth.signInDescription': 'Войдите в свой аккаунт Kateriss',
    'auth.createDescription': 'Присоединяйтесь к тысячам менеджеров ТСЖ, экономящих время с ИИ',
    'auth.continueWithGoogle': 'Продолжить с Google',
    'auth.continueWithApple': 'Продолжить с Apple',
    'auth.or': 'или',
    'auth.fullName': 'Полное Имя',
    'auth.email': 'Адрес Электронной Почты',
    'auth.password': 'Пароль',
    'auth.enterFullName': 'Введите ваше полное имя',
    'auth.enterEmail': 'Введите ваш email',
    'auth.enterPassword': 'Введите ваш пароль',
    'auth.signIn': 'Войти',
    'auth.backToHome': 'Вернуться домой',

    // Video History
    'videos.title': 'Мои Видео',
    'videos.subtitle': 'Управляйте и скачивайте созданные видео',
    'videos.search': 'Поиск видео...',
    'videos.processing': 'Обработка...',
    'videos.failed': 'Ошибка Создания',
    'videos.download': 'Скачать',
    'videos.preview': 'Предпросмотр',
    'videos.retry': 'Повторить Создание',
    'videos.delete': 'Удалить',
    'videos.prompt': 'Запрос:',

    // Orientations
    'orientation.horizontal': '16:9',
    'orientation.vertical': '9:16',

    // Common
    'common.free': 'бесплатный',
    'common.premium': 'премиум',
    'common.basic': 'базовый',
    'common.month': 'месяц'
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'en'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}