const defaultTheme = require("tailwindcss/defaultTheme");


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "2rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "2rem" }],
      "2xl": ["1.5rem", { lineHeight: "2.5rem" }],
      "3xl": ["2rem", { lineHeight: "2.5rem" }],
      "4xl": ["2.5rem", { lineHeight: "3rem" }],
      "5xl": ["3rem", { lineHeight: "3.5rem" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    extend: {
      dropShadow:{
        "launch": [
          "0 10px 60px rgba(219, 227, 248, 0.6)",
          "0 10px 20px rgba(219, 227, 248, 0.2)"
        ],
        "radiant": [
          "0 10px 80px rgba(219, 227, 248, 0.9)",
          "0 10px 10px rgba(219, 227, 248, 0.6)"
        ]
      },
      boxShadow: {
        ambient: "0 35px 120px -10px rgba(51, 102, 255, 0.03)",
        cta: "0 35px 120px -10px rgba(51, 102, 255, 0.1)",
      },
      colors: {
        primary: {

          "100": "#DBE3F8",
          "200": "#B9C8F1",
          "300": "#8B9ED7",
          "400": "#6274AF",
          "500": "#33427B",
          "600": "#253269",
          "700": "#192458",
          "800": "#101847",
          "900": "#090F3B",
        }, success: {

          "100": "#E3F9D0",
          "200": "#C3F3A3",
          "300": "#91DB6F",
          "400": "#62B747",
          "500": "#2B8719",
          "600": "#1A7412",
          "700": "#0D610C",
          "800": "#074E0C",
          "900": "#04400D",
        }, info: {

          "100": "#C8FAF7",
          "200": "#93F4F5",
          "300": "#5AD6E2",
          "400": "#31AEC5",
          "500": "#007BA0",
          "600": "#005F89",
          "700": "#004773",
          "800": "#00335C",
          "900": "#00244C",
        }, warn: {

          "100": "#F9E8C8",
          "200": "#F4CC94",
          "300": "#DFA15C",
          "400": "#C07532",
          "500": "#964003",
          "600": "#812F02",
          "700": "#6C2101",
          "800": "#571500",
          "900": "#480D00",
        }, danger: {

          "100": "#FAD9D0",
          "200": "#F5ADA4",
          "300": "#E27472",
          "400": "#C54B54",
          "500": "#A01C32",
          "600": "#891432",
          "700": "#730E31",
          "800": "#5C082E",
          "900": "#4C052C"
        }
      },

      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["PangeaAfrikan-Regular", ...defaultTheme.fontFamily.sans],
      },

      maxWidth: {
        "8xl": "88rem",
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
      },
      animation: {
        "spin-forward-slow": "spin-forward 8s linear infinite",
        "spin-reverse-slower": "spin-reverse 10s linear infinite",
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
}