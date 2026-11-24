/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        // Tinta escura: rail lateral, banners, overlays
        ink: {
          400: 'var(--color-ink-400)',
          500: 'var(--color-ink-500)',
          600: 'var(--color-ink-600)',
          700: 'var(--color-ink-700)',
          800: 'var(--color-ink-800)',
          900: 'var(--color-ink-900)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
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
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          soft: 'var(--color-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft: 'var(--color-danger-soft)',
          'soft-hover': 'var(--danger-soft-hover)',
        },
        error: 'var(--color-danger)',
        info: {
          DEFAULT: 'var(--color-info)',
          soft: 'var(--color-info-soft)',
        },
        background: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
          sunken: 'var(--color-surface-sunken)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        // Chips pastel do KPI
        tint: {
          sky: 'var(--tint-sky-bg)',
          'sky-fg': 'var(--tint-sky-fg)',
          mint: 'var(--tint-mint-bg)',
          'mint-fg': 'var(--tint-mint-fg)',
          amber: 'var(--tint-amber-bg)',
          'amber-fg': 'var(--tint-amber-fg)',
          rose: 'var(--tint-rose-bg)',
          'rose-fg': 'var(--tint-rose-fg)',
          violet: 'var(--tint-violet-bg)',
          'violet-fg': 'var(--tint-violet-fg)',
          slate: 'var(--tint-slate-bg)',
          'slate-fg': 'var(--tint-slate-fg)',
        },
        // Aliases para compatibilidade com shadcn e classes existentes
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
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
        // Interface e dados
        sans: [
          'var(--font-sans)',
          'IBM Plex Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Títulos e saudação — nunca em número de tabela
        display: [
          'var(--font-display)',
          'Bricolage Grotesque',
          'var(--font-sans)',
          'ui-sans-serif',
          'sans-serif',
        ],
      },
      borderRadius: {
        // Escala generosa da referência — superfície arredondada, nunca pill total
        component: '10px', // inputs, badges, botões
        card: '16px', // cards de conteúdo
        modal: '20px', // modais e diálogos
        rail: '24px', // sidebar flutuante, painéis grandes
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        // Sombra é o separador de superfície — substitui a borda nos cards
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        pop: 'var(--shadow-pop)',
        overlay: 'var(--shadow-overlay)',
        rail: 'var(--shadow-rail)',
        brand: 'var(--shadow-brand)',
        inset: 'var(--shadow-inset)',
        // Aliases antigos — apontam pra nova escala, o código existente sobe junto
        light: 'var(--shadow-sm)',
        medium: 'var(--shadow-card)',
      },
      fontSize: {
        // Design System typography scale
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        // Design System spacing tokens
        1: '4px', // micro
        2: '8px', // micro
        3: '12px', // micro
        4: '16px', // default
        6: '24px', // default
        8: '32px', // macro
        10: '40px', // macro
        12: '48px', // macro
        16: '64px', // macro
      },
    },
  },
  plugins: [],
}

export default config
