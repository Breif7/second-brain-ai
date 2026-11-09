import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#120f16",
        panel: "#1b1620",
        border: "#2e2838",
        accent: "#8b5cf6",
      },
    },
  },
  plugins: [],
} satisfies Config;
