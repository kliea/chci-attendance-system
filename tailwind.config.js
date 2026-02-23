/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        anito: {
          black: '#0D0F14',
          'blue-deep': '#1A3A6B',
          'blue-mid': '#2B5BAA',
          'blue-light': '#E8EEF9',
          white: '#F7F8FA',
          gray: '#6B7280',
          'gray-light': '#D1D5DB',
        },
        // Legacy aliases for gradual migration
        surface: '#ffffff',
        panel: '#f8fafc',
        border: '#D1D5DB',
        muted: '#6B7280',
        ink: '#0D0F14',
        accent: '#2B5BAA',
        danger: '#dc2626',
        success: '#16a34a',
        warn: '#d97706',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
