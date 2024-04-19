/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    screens: {
      xs: '320px',
      sm: '576px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {},
  },
  important: "#root",
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}

