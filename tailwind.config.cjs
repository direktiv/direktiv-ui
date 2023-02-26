const {
  pink,
  pinkDark,
  gray,
  grayDark,
  teal,
  tealDark,
  green,
  greenDark,
  yellow,
  yellowDark,
  blue,
  blueDark,
  red,
  redDark,
  blackA,
} = require("@radix-ui/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

const colorPrimary = {
  primary50: "#EEEFFF",
  primary100: "#CBD1FF",
  primary200: "#A9B2FF",
  primary300: "#8793FF",
  primary400: "#6473FF",
  primary500: "#5364FF",
  primary600: "#4554DF",
  primary700: "#323C99",
  primary800: "#212866",
  primary900: "#4D5469",
};

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        ...blackA,
        ...colorPrimary,
        gray,
        grayDark,
      },
      keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          "color-scheme": "light",
          primary: colorPrimary.primary500,
          "primary-content": gray.gray1,
          secondary: pink.pink9,
          "secondary-content": gray.gray1,
          accent: teal.teal9,
          "accent-content": gray.gray1,
          neutral: gray.gray12,
          "neutral-content": gray.gray1,
          info: blue.blue4,
          "info-content": blue.blue11,
          success: green.green4,
          "success-content": green.green11,
          warning: yellow.yellow4,
          "warning-content": yellow.yellow11,
          error: red.red4,
          "error-content": red.red11,
          "base-100": gray.gray1,
          "base-200": gray.gray2,
          "base-300": gray.gray3,
          "base-content": gray.gray11,
          "--rounded-box": ".3rem",
          "--rounded-btn": ".3rem",
          "--rounded-badge": ".3rem",
          "--animation-btn": "0",
          "--animation-input": "0",
        },
      },
      {
        dark: {
          "color-scheme": "dark",
          primary: colorPrimary.primary500,
          "primary-content": grayDark.gray1,
          secondary: pinkDark.pink9,
          "secondary-content": grayDark.gray1,
          accent: tealDark.teal9,
          "accent-content": grayDark.gray1,
          neutral: grayDark.gray12,
          "neutral-content": grayDark.gray1,
          info: blueDark.blue4,
          "info-content": blueDark.blue11,
          success: greenDark.green4,
          "success-content": greenDark.green11,
          warning: yellowDark.yellow4,
          "warning-content": yellowDark.yellow11,
          error: redDark.red4,
          "error-content": redDark.red11,
          "base-100": grayDark.gray1,
          "base-200": grayDark.gray2,
          "base-300": grayDark.gray3,
          "base-content": grayDark.gray11,
          "--rounded-box": ".3rem",
          "--rounded-btn": ".3rem",
          "--rounded-badge": ".3rem",
          "--animation-btn": "0",
          "--animation-input": "0",
        },
      },
    ],
  },
};
