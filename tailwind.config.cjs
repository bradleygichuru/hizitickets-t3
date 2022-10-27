/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", ,],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        secondary: "#E0E0E0",
        card: "#E9E7FD",
        accent: "#2210C3"

      },

    },
  },

  plugins: [require('daisyui')]
};
