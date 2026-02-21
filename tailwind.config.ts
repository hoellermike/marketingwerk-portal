import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a1a2e',
        accent: '#3572E8',
        gold: '#F5C542',
      },
    },
  },
  plugins: [],
}

export default config
