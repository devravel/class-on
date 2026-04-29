import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#4299E1', // Blue 500
          light: '#BEE3F8',   // Blue 200
          dark: '#2B6CB0',    // Blue 700
        },
        // Gray Scale (Design System)
        gray: {
          100: '#F7FAFC',
          200: '#EDF2F7',
          300: '#E2E8F0',
          400: '#CBD5E0',
          500: '#A0AEC0',
          600: '#718096',
          700: '#4A5568',
          800: '#2D3748',
          900: '#1A202C',
        },
        // Feedback States
        success: '#48BB78',
        warning: '#ED8936',
        error: '#F56565',
        info: '#4299E1',
      },
      fontFamily: {
        // Inter como fonte principal
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Design System border radius tokens
        'component': '8px',  // inputs, badges, botões
        'card': '12px',      // cards de conteúdo
        'modal': '16px',     // modais e diálogos
        // Mantendo valores padrão do Tailwind
        DEFAULT: '8px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        // Design System shadows
        'light': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      fontSize: {
        // Design System typography scale
        'xs': '12px',
        'sm': '14px',
        'md': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        // Design System spacing tokens
        '1': '4px',   // micro
        '2': '8px',   // micro
        '3': '12px',  // micro
        '4': '16px',  // default
        '6': '24px',  // default
        '8': '32px',  // macro
        '10': '40px', // macro
        '12': '48px', // macro
        '16': '64px', // macro
      },
    },
  },
  plugins: [],
} satisfies Config

export default config