import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#070A0F',
        ink2: '#0B0E14',
        fog: '#F2F1EA',
        ash: '#A6AFBA',
        ember: '#C77A1B',
        ember2: '#E09A3C',
        sea: '#1A6A86',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        ui: ['var(--font-ui)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wide2: '0.18em',
      },
      boxShadow: {
        glow: '0 0 40px rgba(199, 122, 27, 0.22)',
      },
      backgroundImage: {
        'radial-ember': 'radial-gradient(900px circle at 20% 10%, rgba(224,154,60,0.22), transparent 60%)',
        'radial-sea': 'radial-gradient(800px circle at 80% 35%, rgba(26,106,134,0.18), transparent 60%)',
      },
    },
  },
  plugins: [],
}

export default config
