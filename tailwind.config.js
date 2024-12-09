/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'light': '#FFFFFF',
        'primary': '#652cb3',
        'secondary': '#e21e80',
        'accent': '#87a9b3',
        'loadingLight': '#e2e8f0',
        'loadingDark' : '#cbd5e1'
      },
      // fontFamily: {
      //   // avenir: ['"Avenir LT Pro"', 'sans-serif'],
      //   // mada: ['"Mada ExtraLight"', 'sans-serif'],
      //   montserrat: ['var(--font-montserrat)'],
      //   bellota: ['var(--font-bellota)'], // Ensure fonts with spaces have " " surrounding it.
      // },
      width: {
        'screen-30': '30vw',
        'screen-50': '50vw',
        'screen-70': '70vw'
      },
      height: {
        'screen-25': '25vh',
        'screen-75': '75vh',
        'screen-90': '90vh',
      }
    },
  },
  plugins: [],
}
