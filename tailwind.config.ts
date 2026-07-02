import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // Brand palette
        violet: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        purple: {
          400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
        },
        cyan: {
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2',
        },
        sky: {
          400: '#38bdf8', 500: '#0ea5e9',
        },
        emerald: {
          400: '#34d399', 500: '#10b981',
        },
        amber: {
          400: '#fbbf24', 500: '#f59e0b',
        },
        // Surface system
        surface: {
          0:  '#09090f',
          1:  '#0d0d16',
          2:  '#11111c',
          3:  '#161622',
          4:  '#1a1a28',
        },
        // Legacy navy (keep for backward compat)
        navy: { 900: '#09090f', 800: '#11111c', 700: '#1a1a28' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
      },
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 40%, #06b6d4 100%)',
        'gradient-brand-h': 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fb923c 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left':  { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(139,92,246,0.3)' },
          '50%':       { boxShadow: '0 0 40px -4px rgba(139,92,246,0.7)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(139,92,246,0.4)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(139,92,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(139,92,246,0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-1200px 0' },
          '100%': { backgroundPosition: '1200px 0' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':       { opacity: '0.7', transform: 'scale(1.06)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-up':         'fade-up 0.5s ease-out',
        'fade-in':         'fade-in 0.4s ease-out',
        'slide-in-right':  'slide-in-right 0.3s ease-out',
        'slide-in-left':   'slide-in-left 0.3s ease-out',
        'pulse-glow':      'pulse-glow 2.5s ease-in-out infinite',
        'pulse-ring':      'pulse-ring 2s ease-out infinite',
        'shimmer':         'shimmer 2.5s linear infinite',
        'breathe':         'breathe 5s ease-in-out infinite',
        'float':           'float 6s ease-in-out infinite',
        'spin-slow':       'spin-slow 10s linear infinite',
        'gradient':        'gradient-shift 6s ease infinite',
        'count-up':        'count-up 0.4s ease-out',
      },
      boxShadow: {
        'glow-purple': '0 0 40px -8px rgba(124,58,237,0.5)',
        'glow-cyan':   '0 0 40px -8px rgba(6,182,212,0.5)',
        'glow-gold':   '0 0 40px -8px rgba(245,158,11,0.5)',
        'glow-green':  '0 0 40px -8px rgba(16,185,129,0.5)',
        'glow-sm':     '0 0 20px -6px rgba(139,92,246,0.4)',
        'card':        '0 4px 24px -4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover':  '0 8px 40px -8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
        'brand':       '0 4px 24px -4px rgba(124,58,237,0.35)',
        'brand-lg':    '0 8px 40px -8px rgba(124,58,237,0.5)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
