/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#0095f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out both',
        'fade-up':     'fadeUp 0.45s ease-out both',
        'slide-up':    'slideUp 0.35s ease-out both',
        'scale-in':    'scaleIn 0.25s ease-out both',
        'float':       'float 7s ease-in-out infinite',
        'float-slow':  'float 10s ease-in-out 3s infinite',
        'pulse-soft':  'pulseSoft 3s ease-in-out infinite',
        'shimmer':     'shimmer 1.6s infinite linear',
        'bounce-dot':  'bounceDot 1.2s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'heart-pop':   'heartPop 0.35s ease-out both',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        fadeUp:    { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp:   { from: { transform: 'translateY(24px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:   { from: { transform: 'scale(0.88)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':     { transform: 'translateY(-18px) rotate(2deg)' },
          '66%':     { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: 0.4 },
          '50%':     { opacity: 0.8 },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to:   { backgroundPosition: '200% center' },
        },
        bounceDot: {
          '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.5 },
          '40%':          { transform: 'scale(1)',   opacity: 1   },
        },
        heartPop: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.4)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};