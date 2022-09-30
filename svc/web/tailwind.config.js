const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "100": "#D7DDFC",
          "200": "#B0BCF9",
          "300": "#8595EE",
          "400": "#6375DE",
          "500": "#3548C8",
          "600": "#2636AC",
          "700": "#1A2690",
          "800": "#101974",
          "900": "#0A1060",
        },
        info: {
          "100": "#CBFDFE",
          "200": "#99F5FD",
          "300": "#65E5FB",
          "400": "#3FCFF7",
          "500": "#02AEF2",
          "600": "#0187D0",
          "700": "#0165AE",
          "800": "#00488C",
          "900": "#003374",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.415", letterSpacing: "-0.01em" }],
        "3xl": ["1.875rem", { lineHeight: "1.333", letterSpacing: "-0.01em" }],
        "4xl": ["2.25rem", { lineHeight: "1.277", letterSpacing: "-0.01em" }],
        "5xl": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "6xl": ["3.75rem", { lineHeight: "1.166", letterSpacing: "-0.01em" }],
        "7xl": ["5rem", { lineHeight: "1", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.4em",
      },
    },
    animation: {
      "fade-in": "fade-in 0.5s linear forwards",
      marquee: "marquee var(--marquee-duration) linear infinite",
      "spin-forward-slow": "spin-forward 8s linear infinite",
      "spin-slow": "spin 4s linear infinite",
      "spin-slower": "spin 6s linear infinite",
      "spin-reverse": "spin-reverse 1s linear infinite",
      "spin-reverse-slow": "spin-reverse 4s linear infinite",
      "spin-reverse-slower": "spin-reverse 10s linear infinite",
    },
    keyframes: {
      "spin-forward": {
        from: {
          transform: "rotate(0deg)",
        },
        to: {
          transform: "rotate(360deg)",
        },
      },
      "spin-reverse": {
        from: {
          transform: "rotate(0)",
        },
        to: {
          transform: "rotate(-360deg)",
        },
      },
      "fade-in": {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
        },
      },
      marquee: {
        "100%": {
          transform: "translateY(-50%)",
        },
      },
    },
    boxShadow: {
      ambient: "0 35px 120px -10px rgba(53, 72, 200, 0.1)",
      cta: "0 35px 120px -10px rgba(53, 72, 200, 0.1)",
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require("@tailwindcss/forms"),
    require("tailwindcss-radix")(),
  ],
};
