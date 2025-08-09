/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => ({ opacityValue }) => {
  if (opacityValue !== undefined) {
    return `rgb(var(${variable}) / ${opacityValue})`
  }
  return `rgb(var(${variable}))`
}

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens
        background: withOpacity('--color-bg'),
        surface: withOpacity('--color-surface'),
        foreground: withOpacity('--color-text'),
        muted: withOpacity('--color-muted'),
        border: withOpacity('--color-border'),
        primary: withOpacity('--color-primary'),
        secondary: withOpacity('--color-secondary'),
        accent: withOpacity('--color-accent'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        destructive: withOpacity('--color-destructive'),
        ring: withOpacity('--color-ring'),

        // Back-compat names (optional)
        darkBg: '#111827',
        lightBg: '#F9FAFB'
      },
      spacing: {
        18: '4.5rem',
        128: '32rem'
      },
      fontSize: {
        '2xs': '0.7rem'
      }
    }
  },
  plugins: []
}

