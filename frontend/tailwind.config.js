/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dcebff",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
