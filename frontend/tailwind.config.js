/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports class-based light/dark toggles
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          glass: 'rgba(30, 41, 59, 0.4)',
          glassBorder: 'rgba(255, 255, 255, 0.08)',
          primary: '#3B82F6', // Blue
          secondary: '#A855F7', // Purple
          accent: '#10B981', // Emerald
          success: '#22C55E', // Green
          warning: '#F97316', // Orange
          error: '#EF4444', // Red
        }
      },
      borderRadius: {
        'card': '16px',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
