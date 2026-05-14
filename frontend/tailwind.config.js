/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        sand: "#f6f2e8",
        coral: "#ea6a47",
        mint: "#7bc6a4",
        gold: "#f2b138"
      },
      fontFamily: {
        display: ["Trebuchet MS", "Segoe UI", "sans-serif"],
        body: ["Segoe UI", "Tahoma", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 50px rgba(20, 33, 61, 0.12)"
      }
    }
  },
  plugins: []
};
