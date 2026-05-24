import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "var(--ink-950)",
          900: "var(--ink-900)",
          850: "var(--ink-850)",
          800: "var(--ink-800)",
          700: "var(--ink-700)",
          600: "var(--ink-600)",
          500: "var(--ink-500)",
          400: "var(--ink-400)",
          300: "var(--ink-300)",
          200: "var(--ink-200)",
          100: "var(--ink-100)",
          50: "var(--ink-50)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          dim: "var(--accent-dim)",
        },
        up: "var(--up)",
        down: "var(--down)",
        bloomberg: {
          blue: "#2962ff",
          dark: "#0a1628",
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
        glow: "0 0 12px var(--accent-glow)",
        terminal: "inset 0 0 0 1px var(--ink-700)",
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
