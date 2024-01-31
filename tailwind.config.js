module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.05)' },
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        darkPrimary: '#1E1E2F', // Your custom dark primary color
        darkSecondary: '#2D2D3A', // Your custom dark secondary color
        lightPurple: '#A288F7', // Your custom light purple color
        darkPurple: '#7C5DBF', // Your custom dark purple color
        gray: {
          750: '#37404d', // Adjust the color value as needed to fit your theme
        },
      },
      padding: {
        'superTiny': '1px',
        'tiny': '3px',       // Custom padding of 5 pixels
  // Custom padding of 3 rem units
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

