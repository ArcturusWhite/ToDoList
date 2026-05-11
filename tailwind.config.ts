import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        paper: "#f8fafc"
      },
      boxShadow: {
        soft: "0 16px 40px -24px rgba(15, 23, 42, 0.42)"
      }
    }
  },
  plugins: []
};

export default config;
