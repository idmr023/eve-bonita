/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        crema: '#FFF8F0',
        rosa: '#FF8FA3',
        'rosa-claro': '#FFD6DE',
        dorado: '#F5D67B',
        cancha: '#2D6A4F',
        barca1: '#A50044',
        barca2: '#004D98',
        tinta: '#2B2D42',
        noche: '#1A1B2E',
        selva: '#3A7D44',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        ui: ['Quicksand', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
