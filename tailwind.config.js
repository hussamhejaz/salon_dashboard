export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: { 
          50:"#faf5ff",
          100:"#f3e8ff",
          200:"#e9d5ff",
          300:"#d8b4fe",
          400:"#c084fc",
          500:"#a855f7",
          600:"#9333ea",
          700:"#7e22ce",
          800:"#6b21a8",
          900:"#581c87" 
        },
        accent: { 
          50:"#fdf4ff",
          500:"#d946ef",
          600:"#c026d3",
          700:"#a21caf" 
        },
        gold: { 
          50: '#FEF9F0',
          100: '#FDF3E1',
          200: '#FBE6C2',
          300: '#F8D9A4',
          400: '#F4CC85',
          500: '#E39B34', // Your main color
          600: '#C7852D',
          700: '#AB6F26',
          800: '#8F591F',
          900: '#734318'
        },
        ink:    "#0f172a",
        cloud:  "#f8fafc",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        "sans-ar": ["var(--font-sans-ar)"],
      },
    },
  },
  plugins: [],
};