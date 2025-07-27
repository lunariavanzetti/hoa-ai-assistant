/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        glass: {
          primary: 'rgba(99, 102, 241, 0.8)',
          secondary: 'rgba(139, 69, 255, 0.75)',
          accent: 'rgba(6, 182, 212, 0.8)',
          success: 'rgba(34, 197, 94, 0.8)',
          warning: 'rgba(251, 191, 36, 0.8)',
          error: 'rgba(239, 68, 68, 0.8)',
          white: 'rgba(255, 255, 255, 0.95)',
          black: 'rgba(0, 0, 0, 0.9)',
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'liquid-pulse': 'liquid-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'toast-enter': 'toast-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'magnetic-hover': 'magnetic-hover 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        'liquid-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-20px)' },
          '100%': { transform: 'translateX(20px)' },
        },
        'toast-enter': {
          from: {
            transform: 'translateY(-100px) scale(0.8)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
        },
        'magnetic-hover': {
          from: { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          to: { transform: 'translateY(-8px) rotateX(15deg) rotateY(5deg)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)', { lineHeight: '1.4' }],
        sm: ['clamp(0.875rem, 0.8rem + 0.3vw, 1rem)', { lineHeight: '1.5' }],
        base: ['clamp(1rem, 0.9rem + 0.4vw, 1.125rem)', { lineHeight: '1.6' }],
        lg: ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.6' }],
        xl: ['clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', { lineHeight: '1.5' }],
        '2xl': ['clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)', { lineHeight: '1.4' }],
        '3xl': ['clamp(1.875rem, 1.6rem + 1vw, 2.25rem)', { lineHeight: '1.3' }],
        '4xl': ['clamp(2.25rem, 1.9rem + 1.4vw, 3rem)', { lineHeight: '1.2' }],
        '5xl': ['clamp(3rem, 2.5rem + 2vw, 4rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(4rem, 3rem + 3vw, 6rem)', { lineHeight: '1' }],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        'glass-xl': '0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
        'primary': '0 8px 32px rgba(99, 102, 241, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)',
        'primary-lg': '0 12px 48px rgba(99, 102, 241, 0.4), 0 6px 24px rgba(0, 0, 0, 0.15)',
      },
      backdropSaturate: {
        200: '200%',
        250: '250%',
      },
      backdropContrast: {
        110: '110%',
        120: '120%',
      },
    },
  },
  plugins: [],
}