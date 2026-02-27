/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* ── Fonts ── */
      fontFamily: {
        /* font-display → Playfair Display (replaces Cormorant Garamond) */
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        /* font-sans → Inter (replaces DM Sans) */
        sans: ['"Inter"', 'sans-serif'],
        /* font-heading → Montserrat (subtitles / hero labels) */
        heading: ['"Montserrat"', '"Inter"', 'sans-serif'],
      },

      /* ── Colors ── */
      colors: {
        /* ─ CHCI anito-* palette (remapped to CHCI navy/blue) ─ */
        anito: {
          black:        '#0D0F14',
          'blue-deep':  '#0A3D91',   /* primary navy  (was #1A3A6B) */
          'blue-mid':   '#3A7CC3',   /* secondary blue (was #2B5BAA) */
          'blue-light': '#f1f5f9',   /* muted bg       (was #E8EEF9) */
          white:        '#F7F8FA',
          gray:         '#6B7280',
          'gray-light': '#D1D5DB',
        },

        /* ─ shadcn-vue CSS-var tokens ─ */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },

        /* ─ Semantic shortcuts ─ */
        danger:  '#dc2626',
        success: '#16a34a',
        warn:    '#d97706',
      },

      /* ── Border Radius ── */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
