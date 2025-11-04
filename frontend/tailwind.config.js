/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: '#17212B',
          secondary: '#242F3D',
          text: '#FFFFFF',
          hint: '#708499',
          link: '#5288C1',
          button: '#5288C1',
          destructive: '#E53935',
        },
        game: {
          green: '#00C851',
          red: '#FF4444',
          orange: '#FF8800',
          blue: '#2196F3',
        }
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'rocket-fly': 'rocketFly 1s ease-in-out infinite',
        'multiplier-pulse': 'multiplierPulse 0.5s ease-in-out infinite',
        'crash-explosion': 'crashExplosion 1.5s ease-out',
        'bet-success': 'betSuccess 0.5s ease-out',
        'fire-flicker': 'fireFlicker 0.3s ease-in-out infinite alternate',
        'smoke-drift': 'smokeDrift 2s ease-out infinite',
      },
      keyframes: {
        rocketFly: {
          '0%, 100%': { 
            transform: 'translateY(0px) scale(1)',
            filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))'
          },
          '50%': { 
            transform: 'translateY(-5px) scale(1.02)',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.5))'
          },
        },
        multiplierPulse: {
          '0%': { 
            transform: 'scale(1)',
            textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            textShadow: '0 0 20px rgba(34, 197, 94, 0.8)'
          },
          '100%': { 
            transform: 'scale(1)',
            textShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
          },
        },
        crashExplosion: {
          '0%': { 
            transform: 'scale(1) rotate(0deg)', 
            opacity: '1',
            filter: 'hue-rotate(0deg)'
          },
          '25%': { 
            transform: 'scale(1.5) rotate(90deg)', 
            opacity: '0.9',
            filter: 'hue-rotate(45deg)'
          },
          '50%': { 
            transform: 'scale(2.5) rotate(180deg)', 
            opacity: '0.7',
            filter: 'hue-rotate(90deg)'
          },
          '100%': { 
            transform: 'scale(4) rotate(360deg)', 
            opacity: '0',
            filter: 'hue-rotate(180deg)'
          },
        },
        fireFlicker: {
          '0%': { 
            transform: 'scale(1) rotate(-2deg)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(1.1) rotate(2deg)',
            opacity: '1'
          },
        },
        smokeDrift: {
          '0%': { 
            transform: 'translateY(0px) scale(0.8)',
            opacity: '0.6'
          },
          '100%': { 
            transform: 'translateY(-20px) scale(1.2)',
            opacity: '0'
          },
        },
        betSuccess: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgb(22 163 74)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94)' },
        },
      }
    },
  },
  plugins: [],
}
