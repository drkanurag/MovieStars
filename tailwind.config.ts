import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: "#06080d",
          canvas: "#090d14",
          card: "#0f1622",
          elevated: "#151f30",
          border: "#1f2c42",
          borderLight: "#2d3e5c",
          gold: "#f5c518",
          goldLight: "#fde047",
          goldDark: "#d97706",
          red: "#e50914",
          accent: "#38bdf8",
          emerald: "#10b981",
        },
      },
      boxShadow: {
        'glow-gold': '0 0 30px -5px rgba(245, 197, 24, 0.3)',
        'glow-accent': '0 0 30px -5px rgba(56, 189, 248, 0.3)',
        'glow-red': '0 0 30px -5px rgba(229, 9, 20, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'cinema-gradient': 'radial-gradient(ellipse at top, #182338 0%, #06080d 70%)',
        'gold-shimmer': 'linear-gradient(90deg, #f5c518 0%, #ffd83d 50%, #f5c518 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
