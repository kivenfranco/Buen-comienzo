import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fef9ec",
          100: "#fdf0ca",
          200: "#fae08f",
          300: "#f7cb54",
          400: "#f4b830",
          500: "#ee9b14",
          600: "#d37a0e",
          700: "#ae5a0f",
          800: "#8d4714",
          900: "#743b14",
        },
        green: {
          brand: "#2e7d32",
          light: "#4caf50",
          pale:  "#e8f5e9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #1b5e20 0%, #2e7d32 30%, #388e3c 60%, #f57f17 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        card:  "0 4px 24px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out",
        "slide-up":   "slideUp 0.6s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
