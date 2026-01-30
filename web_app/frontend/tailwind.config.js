/** @type {import('tailwindcss').Config} */
export default {
  // =============================================================================
  // TAILWIND CSS v4 CONFIGURATION
  // Note: In v4, most theme customization is done in CSS via @theme directive.
  // This file is primarily for content paths and plugins.
  // =============================================================================

  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],

  // Dark mode is enabled via .dark class on html element
  darkMode: 'class',

  theme: {
    extend: {},
  },

  plugins: [],
}