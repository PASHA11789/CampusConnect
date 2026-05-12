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
      }
    },
  },
  plugins: [],
}
