/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        phyto: {
          forest: '#1B4332',
          leaf: '#2D6A4F',
          mint: '#52B788',
          sage: '#D8F3DC',
          cream: '#F7FAF3',
          sand: '#E9E0C8',
          bark: '#533D2D',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(27, 67, 50, 0.08)',
      },
    },
  },
  plugins: [],
}

