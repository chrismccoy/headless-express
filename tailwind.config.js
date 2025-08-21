module.exports = {
  content: [
    "./views/**/*.ejs", // Scan all .ejs files in the views folder
    "./src/**/*.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
