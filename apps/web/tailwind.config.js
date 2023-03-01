const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./pages/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./docs-components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))",
        "gradient-divider": "radial-gradient(50% 30% at 50% 0%, var(--tw-gradient-stops))",
        "gradient-feature": "radial-gradient(50% 50% at 0% 50%, var(--tw-gradient-stops))",
        "gradient-feature-to-l": "radial-gradient(100% 50% at 100% 50%, var(--tw-gradient-stops))",
        "gradient-feature-to-r": "radial-gradient(100% 50% at 0% 50%, var(--tw-gradient-stops))",
      },
      dropShadow: {
        launch: ["0 10px 80px rgba(19, 77, 248, 0.9)", "0 10px 10px rgba(19, 77, 248, 0.6)"],
        cta: ["0 10px 50px rgba(219, 227, 248, 0.4)"],
        feature: ["0 10px 40px rgba(212, 212, 216, 0.3)"],
      },
      boxShadow: {
        ambient: "0 35px 120px -10px rgba(51, 102, 255, 0.03)",
        cta: "0 35px 120px -10px rgba(51, 102, 255, 0.1)",
      },
      colors: {
        primary: {
          100: "#D6E4FF",
          200: "#ADC8FF",
          300: "#84A9FF",
          400: "#6690FF",
          500: "#3366FF",
          600: "#254EDB",
          700: "#1939B7",
          800: "#102693",
          900: "#091A7A",
        },
        // zinc: defaultTheme.colors.neutral,
        x: {
          50: "#FCFCFE",
          100: "#F4F4F8",
          200: "#EAEAF1",
          300: "#CDCDD7",
          400: "#A5A5AF",
          500: "#71715A",
          600: "#525238",
          700: "#383827",
          800: "#242426",
          900: "#15151A",
        },
        success: {
          100: "#E3F9D0",
          200: "#C3F3A3",
          300: "#91DB6F",
          400: "#62B747",
          500: "#2B8719",
          600: "#1A7412",
          700: "#0D610C",
          800: "#074E0C",
          900: "#04400D",
        },
        info: {
          100: "#C8FAF7",
          200: "#93F4F5",
          300: "#5AD6E2",
          400: "#31AEC5",
          500: "#007BA0",
          600: "#005F89",
          700: "#004773",
          800: "#00335C",
          900: "#00244C",
        },
        warn: {
          100: "#F9E8C8",
          200: "#F4CC94",
          300: "#DFA15C",
          400: "#C07532",
          500: "#964003",
          600: "#812F02",
          700: "#6C2101",
          800: "#571500",
          900: "#480D00",
        },
        danger: {
          100: "#FAD9D0",
          200: "#F5ADA4",
          300: "#E27472",
          400: "#C54B54",
          500: "#A01C32",
          600: "#891432",
          700: "#730E31",
          800: "#5C082E",
          900: "#4C052C",
        },
      },

      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
        display: ["Lexend", ...defaultTheme.fontFamily.sans],
      },

      maxWidth: {
        "8xl": "88rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },

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
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "slide-down": {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        // Tooltip
        "slide-up-fade": {
          "0%": { opacity: 0, transform: "translateY(2px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-right-fade": {
          "0%": { opacity: 0, transform: "translateX(-2px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "slide-down-fade": {
          "0%": { opacity: 0, transform: "translateY(-2px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-left-fade": {
          "0%": { opacity: 0, transform: "translateX(2px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        // Navigation menu
        "enter-from-right": {
          "0%": { transform: "translateX(200px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "enter-from-left": {
          "0%": { transform: "translateX(-200px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "exit-to-right": {
          "0%": { transform: "translateX(0)", opacity: 1 },
          "100%": { transform: "translateX(200px)", opacity: 0 },
        },
        "exit-to-left": {
          "0%": { transform: "translateX(0)", opacity: 1 },
          "100%": { transform: "translateX(-200px)", opacity: 0 },
        },
        "scale-in-content": {
          "0%": { transform: "rotateX(-30deg) scale(0.9)", opacity: 0 },
          "100%": { transform: "rotateX(0deg) scale(1)", opacity: 1 },
        },
        "scale-out-content": {
          "0%": { transform: "rotateX(0deg) scale(1)", opacity: 1 },
          "100%": { transform: "rotateX(-10deg) scale(0.95)", opacity: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        // Toast
        "toast-hide": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "toast-slide-in-right": {
          "0%": { transform: "translateX(calc(100% + 1rem))" },
          "100%": { transform: "translateX(0)" },
        },
        "toast-slide-in-bottom": {
          "0%": { transform: "translateY(calc(100% + 1rem))" },
          "100%": { transform: "translateY(0)" },
        },
        "toast-swipe-out": {
          "0%": { transform: "translateX(var(--radix-toast-swipe-end-x))" },
          "100%": {
            transform: "translateX(calc(100% + 1rem))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Rings in hero
        "spin-forward-slow": "spin-forward 8s linear infinite",
        "spin-reverse-slower": "spin-reverse 10s linear infinite",
        // Dropdown menu
        "scale-in": "scale-in 0.2s ease-in-out",
        "slide-down": "slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        // Tooltip
        "slide-up-fade": "slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right-fade": "slide-right-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down-fade": "slide-down-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left-fade": "slide-left-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        // Navigation menu
        "enter-from-right": "enter-from-right 0.25s ease",
        "enter-from-left": "enter-from-left 0.25s ease",
        "exit-to-right": "exit-to-right 0.25s ease",
        "exit-to-left": "exit-to-left 0.25s ease",
        "scale-in-content": "scale-in-content 0.2s ease",
        "scale-out-content": "scale-out-content 0.2s ease",
        "fade-in": "fade-in 0.2s ease",
        "fade-out": "fade-out 0.2s ease",
        // Toast
        "toast-hide": "toast-hide 100ms ease-in forwards",
        "toast-slide-in-right": "toast-slide-in-right 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-slide-in-bottom": "toast-slide-in-bottom 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-swipe-out": "toast-swipe-out 100ms ease-out forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-debug-screens"),
    require("tailwindcss-animate"),
  ],
};
