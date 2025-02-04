/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          800: '#1F1F1F', // Warmer, more neutral grayish-black
        },
      },
    },
  },
  plugins: [],
};