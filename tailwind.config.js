/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        vollkron: ["Vollkorn", "serif"]
      },
      backgroundImage:{
        'greenTwo': "url('./src/assets/green-2.jpg)",
      }
    },
  },
  plugins: [],
}

