/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],
  theme: {
    extend: {
      colors: {
        "pop-cyan": "#5CE1E6",
        "pop-yellow": "#FFDE59",
        "pop-pink": "#FF90E8",
        black: "#000000",
        white: "#FFFFFF",
        "pop-lime": "#B6FF3B",
        "pop-orange": "#FF7A00",
        "pop-purple": "#9B5CFF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        "hard-sm": "4px 4px 0 0 #000",
        "hard-md": "6px 6px 0 0 #000",
        "hard-lg": "8px 8px 0 0 #000",
        "hard-xl": "12px 12px 0 0 #000",
        none: "0 0 0 0 #000",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
