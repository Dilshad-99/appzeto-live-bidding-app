/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF3E0',
          200: '#F4E5B8',
          300: '#EED48C',
          400: '#E5C058',
          500: '#D4AF37', // Classic Rich Gold
          600: '#B8860B', // Darker Gold
          700: '#8C6608',
          800: '#5C4305',
          900: '#332503',
        },
        primary: {
          DEFAULT: '#D4AF37',
          hover: '#C59B27',
          dark: '#B8860B',
          light: '#FAF3E0',
        },
        page: '#FFFFFF',
        surface: '#FFFFFF',
        darkHeading: '#000000',
        live: '#16A34A',
        outbid: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
