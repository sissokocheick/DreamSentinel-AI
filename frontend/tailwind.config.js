/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#07090e",
        surface: "#0e131f",
        surfaceBorder: "#1e293b",
        surfaceHover: "#161f33",
        somniaPurple: "#9333ea",
        somniaCyan: "#06b6d4",
        somniaEmerald: "#10b981",
        somniaRose: "#f43f5e",
        somniaAmber: "#f59e0b",
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.2))' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
};
