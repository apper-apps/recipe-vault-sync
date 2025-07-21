/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fdf2f0',
          100: '#fbe6e2',
          500: '#E85D3B',
          600: '#d64428',
          700: '#b8311a'
        },
        charcoal: {
          500: '#2D3436',
          600: '#1e2426',
          700: '#151a1c'
        },
        saffron: {
          400: '#f5b041',
          500: '#F39C12',
          600: '#d68910'
        },
        cream: {
          50: '#FAF7F5',
          100: '#f5f0ec',
          200: '#ebe0d8'
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif']
      },
      borderRadius: {
        '12': '12px'
      },
      boxShadow: {
        'recipe-card': '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'recipe-card-hover': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)'
      }
    },
  },
  plugins: [],
}