module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkPrimary: '#1E1E2F', // Your custom dark primary color
        darkSecondary: '#2D2D3A', // Your custom dark secondary color
        lightPurple: '#A288F7', // Your custom light purple color
        darkPurple: '#7C5DBF', // Your custom dark purple color
        gray: {
          750: '#37404d', // Adjust the color value as needed to fit your theme
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        'micro': '10px',
      },
    },
  },
  plugins: [],
}

