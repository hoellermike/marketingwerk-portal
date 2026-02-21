import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a1a2e',
        accent: '#4361ee',
      },
    },
  },
  plugins: [],
}

export default config
