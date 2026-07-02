import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#020202",
        dark: "#0a0a0a",
        dark2: "#111111",
        dark3: "#161616",
        gray1: "#1e1e1e",
        gray2: "#2a2a2a",
        yellow: "#FFD600",
        yellow2: "#FFC107",
        yellow3: "#FF9800",
        white1: "#FAFAFA",
        white2: "#cccccc",
      },
      fontFamily: {
        hero: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-barlow)", "sans-serif"],
        cond: ["var(--font-barlow-cond)", "sans-serif"],
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease infinite",
        "float": "float 4s ease infinite",
        "particle": "particle-float linear infinite",
        "lightning": "lightning-flash 4s ease infinite",
        "typing": "typing 1.2s ease infinite",
        "fill-bar": "fill-bar 2s ease forwards",
        "fade-in-left": "fadeInLeft 1s ease both",
        "fade-in-right": "fadeInRight 1.2s ease 0.3s both",
      },
      keyframes: {
        "pulse-glow": {
          "0%,100%": { opacity: "0.6", transform: "translateX(-50%) scale(1)" },
          "50%": { opacity: "1", transform: "translateX(-50%) scale(1.1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(-50%) translateY(0)" },
          "50%": { transform: "translateY(-50%) translateY(-12px)" },
        },
        "particle-float": {
          "0%": { opacity: "0", transform: "translateY(100vh) scale(0)" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.3" },
          "100%": { opacity: "0", transform: "translateY(-100px) scale(1.5)" },
        },
        "lightning-flash": {
          "0%,90%,100%": { opacity: "0" },
          "92%,96%": { opacity: "1" },
          "94%": { opacity: "0.3" },
        },
        typing: {
          "0%,60%,100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        "fill-bar": {
          from: { width: "0" },
          to: { width: "var(--bar-width)" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(40px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backdropBlur: {
        "20": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
