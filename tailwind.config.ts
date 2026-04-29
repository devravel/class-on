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
        brand: {
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
        neutral: {
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          950: 'var(--color-neutral-950)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        error: 'var(--color-danger)',
        info: 'var(--color-info)',
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        // Aliases para compatibilidade com shadcn e classes existentes
        primary: {
          DEFAULT: 'var(--color-brand-500)',
          light: 'var(--color-brand-200)',
          dark: 'var(--color-brand-700)',
        },
        gray: {
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          950: 'var(--color-neutral-950)',
        },
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