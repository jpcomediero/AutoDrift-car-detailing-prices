import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
          accent: "#ff1a24",
          electric: "#ef4444",
        },
        dark: {
          bg: "#050505",
          card: "#0f0f0f",
          cardHover: "#171717",
          surface: "#1f1f1f",
          border: "#292929",
          borderLight: "#3d3d3d",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glossy-card":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "glossy-glow":
          "radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.18) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(239, 68, 68, 0.5)",
        "glow-sm": "0 0 15px -3px rgba(239, 68, 68, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
