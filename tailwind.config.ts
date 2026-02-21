import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1E1B2E',
        'navy-light': '#2D2A42',
        'navy-muted': '#8B8A9E',
      },
    },
  },
  plugins: [],
}

export default config
