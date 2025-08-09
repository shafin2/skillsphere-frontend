/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F2F1FF',
          100: '#E8E6FF',
          200: '#CCC9FF',
          300: '#ABA6FF',
          400: '#8F88FF',
          500: '#6C5CE7',
          600: '#5A4CD0',
          700: '#4A3FB6',
          800: '#3B3294',
          900: '#312A7A'
        },
        accent: {
          DEFAULT: '#00C2A8',
          600: '#00A994',
          700: '#008D7B'
        },
        muted: {
          DEFAULT: '#64748B'
        },
        background: {
          light: '#FFFFFF',
          dark: '#0B1220'
        },
        foreground: {
          light: '#0B1220',
          dark: '#E6E6EA'
        }
      }
    }
  },
  plugins: []
} 