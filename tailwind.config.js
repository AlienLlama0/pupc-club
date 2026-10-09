/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0a0405', 900: '#120607', 850: '#18090b', 800: '#1f0c0f', 750: '#270f13', 700: '#301217', 600: '#46181f' },
        ice: '#fff0ef',
        cream: '#f4f0e6',
        pill: '#f1f1f1',
        cyan: { DEFAULT: '#ff5a5f' },
        violet: { DEFAULT: '#c4142f' },
        ember: '#ff3b3b',
      },
      fontFamily: {
        display: ['Saira', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(255,59,59,.35)',
        card: '0 10px 30px -12px rgba(0,0,0,.6)',
      },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        drift: { '0%,100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(30px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(6px)' } },
      },
      animation: { rise: 'rise .6s ease both', drift: 'drift 12s ease-in-out infinite', bob: 'bob 2s ease-in-out infinite' },
    },
  },
  plugins: [],
};
