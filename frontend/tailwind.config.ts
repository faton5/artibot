import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
        mono:    ["'DM Mono'", "monospace"],
      },
      colors: {
        forge: {
          950: "#08080a",
          900: "#111113",
          800: "#1e1e22",
          700: "#3a3a40",
          600: "#5a5a62",
          500: "#75757f",
          400: "#8e8e98",
          300: "#b0b0ba",
          200: "#d0d0d8",
          100: "#e8e8ef",
          50:  "#f2f2f7",
        },
        amber: {
          700: "#b45309",
          600: "#d97706",
          500: "#f59e0b",
          400: "#fbbf24",
          100: "#fef3c7",
          50:  "#fffbeb",
        },
        canvas:  "#f7f6f3",
        surface: "#ffffff",
      },
      fontWeight: {
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
      },
    },
  },
  plugins: [],
};

export default config;
