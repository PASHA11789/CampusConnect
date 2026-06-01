/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0D2A42',
        'brand-teal': '#008C9E',
        'brand-light-teal': '#66D9E8',
      },
      keyframes: {
        dbSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dbSlideRight: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalSlideIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(15px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(-12deg)' },
          '100%': { transform: 'translateX(250%) skewX(-12deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        'slide-down': 'dbSlideDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'slide-right': 'dbSlideRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'modal-fade-in': 'modalFadeIn 0.25s ease-out forwards',
        'modal-slide-in': 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blob': 'blob 7s infinite alternate',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

