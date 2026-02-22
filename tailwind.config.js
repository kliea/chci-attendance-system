/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        panel: '#f8fafc',
        border: '#e2e8f0',
        muted: '#64748b',
        ink: '#0f172a',
        accent: '#2563eb',
        danger: '#dc2626',
        success: '#16a34a',
        warn: '#d97706',
      },
      fontFamily: {
        display: ['DM Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
