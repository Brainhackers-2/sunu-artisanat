import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Theme variables with Senegal default palette
        forest: {
          DEFAULT: "var(--color-forest, #125B3E)",
          50: "#E8F3EE",
          100: "#C6E3D4",
          500: "var(--color-forest, #125B3E)",
          600: "#0E4831",
          700: "#0A3524",
        },
        gold: {
          DEFAULT: "var(--color-gold, #FFB800)",
          50: "#FFF8E6",
          100: "#FFEDB3",
          500: "var(--color-gold, #FFB800)",
          600: "#D99D00",
          700: "#B38200",
        },
        terracotta: {
          DEFAULT: "var(--color-terracotta, #C2410C)",
          50: "#FDF2EC",
          100: "#F9DEC9",
          500: "var(--color-terracotta, #C2410C)",
          600: "#9A3412",
          700: "#7C2D12",
        },
        ebony: {
          DEFAULT: "var(--color-ebony, #131622)",
          50: "#ECEEF4",
          100: "#D3D6E2",
          500: "var(--color-ebony, #131622)",
          800: "#0D0F18",
          900: "#07080D",
        },
        ivory: {
          DEFAULT: "var(--color-ivory, #FAF8F5)",
          50: "#FFFFFF",
          100: "#FAF8F5",
          200: "#F3EDE4",
          300: "#E7DCD0",
        },
        border: "hsl(var(--border, 240 5.9% 90%))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
