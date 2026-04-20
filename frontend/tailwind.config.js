const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      keyframes: {
        levitate: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'sparkle-float': {
          '0%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0) rotate(360deg)' },
        },
        'sparkle-drift': {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0)' },
          '20%': { opacity: '1', transform: 'translateY(-8px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(0.3)' },
        },
      },
      animation: {
        levitate: 'levitate 3s ease-in-out infinite',
        'sparkle-float': 'sparkle-float 2s ease-in-out infinite',
        'sparkle-drift': 'sparkle-drift 2.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
