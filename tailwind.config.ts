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
      },
    },
  },
  plugins: [],
};

export default config;
