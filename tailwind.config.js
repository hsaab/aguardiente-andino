/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — emerald primary, gold accent, cream surface
        emerald: {
          DEFAULT: '#065f46',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          DEFAULT: '#d97706',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        cream: '#fafaf7',
        surface: '#ffffff',
        charcoal: '#18181b',
        muted: '#71717a',
        danger: '#b91c1c',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Projector-friendly sizing
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],
        'sm': ['1rem', { lineHeight: '1.5rem' }],
        'base': ['1.125rem', { lineHeight: '1.75rem' }],
        'lg': ['1.25rem', { lineHeight: '1.875rem' }],
        'xl': ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '4xl': ['3rem', { lineHeight: '1.1' }],
        '5xl': ['3.75rem', { lineHeight: '1.05' }],
        '6xl': ['4.5rem', { lineHeight: '1' }],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(24, 24, 27, 0.04), 0 1px 3px rgba(24, 24, 27, 0.06)',
        'card-hover': '0 4px 12px rgba(6, 95, 70, 0.08), 0 2px 4px rgba(24, 24, 27, 0.04)',
      },
    },
  },
  plugins: [],
};
