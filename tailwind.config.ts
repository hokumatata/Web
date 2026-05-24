import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#000000",
          900: "#050505",
          850: "#0a0a0a",
          800: "#111111",
          700: "#1a1a1a",
          600: "#252525",
          500: "#333333",
          400: "#555555",
          300: "#888888",
          200: "#aaaaaa",
          100: "#cccccc",
          50: "#eeeeee",
        },
        accent: {
          DEFAULT: "#ff8800",
          soft: "#ffaa44",
          dim: "#663300",
        },
        up: "#00d26a",
        down: "#ff3333",
        bloomberg: {
          blue: "#2962ff",
          dark: "#000000",
          gold: "#f5a623",
          orange: "#ff8800",
        },
      },
      fontFamily: {
        sans: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        serif: ["'Source Serif 4'", "'Source Serif Pro'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
        "3xs": ["0.5625rem", { lineHeight: "0.75rem" }],
      },
      borderRadius: {
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
      },
      boxShadow: {
        rail: "inset 0 -1px 0 0 rgba(255,255,255,0.05)",
        glow: "0 0 12px rgba(255, 136, 0, 0.2)",
        terminal: "inset 0 0 0 1px #1a1a1a",
      },
      animation: {
        "ticker-scroll": "ticker-scroll 60s linear infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        "ticker-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
