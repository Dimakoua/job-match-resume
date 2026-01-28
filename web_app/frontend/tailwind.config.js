/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2463eb',
        'background-light': '#f6f6f8',
        'background-dark': '#111621',
        error: '#f43f5e',
        success: '#10b981',
        ai: '#8b5cf6',
      },
    },
  },
  plugins: [],
}