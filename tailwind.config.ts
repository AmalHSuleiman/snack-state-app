import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        energized: { DEFAULT: "#F59E0B", light: "#FEF3C7", text: "#92400E" },
        focused:   { DEFAULT: "#3B82F6", light: "#EFF6FF", text: "#1E40AF" },
        calm:      { DEFAULT: "#10B981", light: "#ECFDF5", text: "#065F46" },
        uplifted:  { DEFAULT: "#8B5CF6", light: "#F5F3FF", text: "#4C1D95" },
        sleep:     { DEFAULT: "#6366F1", light: "#EEF2FF", text: "#312E81" },
      },
    },
  },
  plugins: [],
};

export default config;
