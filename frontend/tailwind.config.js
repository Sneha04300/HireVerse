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
          blue: "#2563EB",
        },
        surface: {
          base: "#F8FAFC",
          card: "#FFFFFF",
          input: "#FFFFFF",
          border: "#E5E7EB",
          "border-focus": "#2563EB",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #FFFFFF 0%, #EEF4FF 100%)",
        "btn-gradient": "linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)",
        "logo-gradient": "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
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
