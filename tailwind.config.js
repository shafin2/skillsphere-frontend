/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',
        secondary: '#9333EA',
        accent: '#F59E0B',
        darkBg: '#111827',
        lightBg: '#F9FAFB',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: '#1D4ED8',
              '&:hover': { color: '#9333EA' },
            },
            h1: { scrollMarginTop: '1.25rem' },
          },
        },
        dark: {
          css: {
            color: '#e5e7eb',
            a: { color: '#93c5fd' },
          },
        },
      },
    },
  },
  plugins: [typography],
}
