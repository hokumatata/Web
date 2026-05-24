import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070809",
          900: "#0b0d12",
          850: "#10131a",
          800: "#161a23",
          700: "#1f2430",
          600: "#2b3140",
          500: "#3a4254",
          400: "#5b6477",
          300: "#8a93a6",
          200: "#b8bfcf",
          100: "#dde2ec",
          50: "#f4f6fb",
        },
        accent: {
          DEFAULT: "#fa6900",
          soft: "#ffb37a",
          dim: "#7a3300",
        },
        up: "#16a34a",
        down: "#dc2626",
        bloomberg: {
          blue: "#2962ff",
          dark: "#000000",
          gold: "#f5a623",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["'Source Serif 4'", "'Source Serif Pro'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        rail: "inset 0 -1px 0 0 rgba(255,255,255,0.05)",
        glow: "0 0 20px rgba(250, 105, 0, 0.15)",
      },
      animation: {
        "ticker-scroll": "ticker-scroll 80s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        "ticker-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
