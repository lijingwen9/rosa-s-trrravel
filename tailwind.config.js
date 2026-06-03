/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        'primary-light': '#93c5fd',
        accent: '#f97316',
        'accent-light': '#fdba74',
      }
    },
  },
  plugins: [],
}
