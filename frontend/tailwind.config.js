/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C3AED",
          violet: "#8B5CF6",
          cyan: "#06B6D4",
          "purple-light": "#A78BFA",
        },
        surface: {
          base: "#0D0F1A",
          card: "#111827",
          input: "#1a1f2e",
          border: "#252d3d",
          "border-focus": "#4B5563",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #1a1040 0%, #0f172a 40%, #0a2a2a 100%)",
        "btn-gradient": "linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)",
        "logo-gradient": "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
