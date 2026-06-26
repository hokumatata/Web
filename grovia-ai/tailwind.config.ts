import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
        },
        whatsapp: "#25d366",
        ink: {
          900: "#0b1020",
          800: "#1a2036",
          700: "#2b3350",
          600: "#4b5572",
          500: "#6b7390",
          400: "#9aa0b8",
          300: "#c4c8da",
          200: "#e2e5f0",
          100: "#f1f3fa",
          50: "#f8f9fd",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)",
        "card-lg": "0 10px 30px rgba(16,24,40,0.10), 0 4px 8px rgba(16,24,40,0.04)",
        glow: "0 8px 40px rgba(99,102,241,0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #4f46e5 0%, #6366f1 45%, #14b8a6 100%)",
        "brand-radial": "radial-gradient(60% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(255,255,255,0) 70%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
