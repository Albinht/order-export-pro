/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(30, 95, 255)',
        'primary-dark': 'rgb(20, 70, 220)',
        orange: 'rgb(255, 107, 0)',
        dark: 'rgb(23, 26, 33)',
        'gray-dark': 'rgb(37, 42, 52)',
        light: 'rgb(243, 244, 246)',
        background: 'rgb(250, 250, 252)',
        foreground: 'rgb(23, 26, 33)',
        border: 'rgb(229, 231, 235)',
      },
    },
  },
  plugins: [],
}
