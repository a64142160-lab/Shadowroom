/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        accent2: 'var(--accent2)',
        green: 'var(--green)',
        red: 'var(--red)',
        yellow: 'var(--yellow)',
        text: 'var(--text)',
        muted: 'var(--muted)'
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace']
      },
      boxShadow: {
        glow: '0 0 90px -20px rgba(124, 92, 252, 0.55)'
      },
      keyframes: {
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0.7)', opacity: '0.35' },
          '40%': { transform: 'scale(1)', opacity: '1' }
        },
        slideUpFade: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        pulseDot: 'pulseDot 1s infinite ease-in-out',
        slideUpFade: 'slideUpFade 0.28s ease-out'
      }
    }
  },
  plugins: []
};
