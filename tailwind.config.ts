import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1E1B2E',
        'navy-light': '#2D2A42',
        'navy-muted': '#8B8A9E',
        accent: '#3572E8',
        gold: '#F5C542',
        'content-bg': '#F8F9FC',
        'card-border': '#E8E8EF',
        'kpi-mint': '#E8F5F0',
        'kpi-peach': '#FEF0E8',
        'kpi-blue': '#E8F0FE',
        'kpi-purple': '#F0E8FE',
        'kpi-gold': '#FEF5E8',
      },
    },
  },
  plugins: [],
}

export default config
