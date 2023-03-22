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
  whiteA,
} = require("@radix-ui/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      mono: ["RobotoMono", ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        primary: {
          50: "#EEEFFF",
          100: "#CBD1FF",
          200: "#A9B2FF",
          300: "#8793FF",
          400: "#6473FF",
          500: "#5364FF",
          600: "#4554DF",
          700: "#323C99",
          800: "#212866",
          900: "#4D5469",
        },
        "black-alpha": {
          1: blackA.blackA1,
          2: blackA.blackA2,
          3: blackA.blackA3,
          4: blackA.blackA4,
          5: blackA.blackA5,
          6: blackA.blackA6,
          7: blackA.blackA7,
          8: blackA.blackA8,
          9: blackA.blackA9,
          10: blackA.blackA10,
          11: blackA.blackA11,
          12: blackA.blackA12,
        },
        "white-alpha": {
          1: whiteA.whiteA1,
          2: whiteA.whiteA2,
          3: whiteA.whiteA3,
          4: whiteA.whiteA4,
          5: whiteA.whiteA5,
          6: whiteA.whiteA6,
          7: whiteA.whiteA7,
          8: whiteA.whiteA8,
          9: whiteA.whiteA9,
          10: whiteA.whiteA10,
          11: whiteA.whiteA11,
          12: whiteA.whiteA12,
        },
        gray: {
          1: gray.gray1,
          2: gray.gray2,
          3: gray.gray3,
          4: gray.gray4,
          5: gray.gray5,
          6: gray.gray6,
          7: gray.gray7,
          8: gray.gray8,
          9: gray.gray9,
          10: gray.gray10,
          11: gray.gray11,
          12: gray.gray12,
        },
        "gray-dark": {
          1: grayDark.gray1,
          2: grayDark.gray2,
          3: grayDark.gray3,
          4: grayDark.gray4,
          5: grayDark.gray5,
          6: grayDark.gray6,
          7: grayDark.gray7,
          8: grayDark.gray8,
          9: grayDark.gray9,
          10: grayDark.gray10,
          11: grayDark.gray11,
          12: grayDark.gray12,
        },
        danger: {
          1: red.red1,
          2: red.red2,
          3: red.red3,
          4: red.red4,
          5: red.red5,
          6: red.red6,
          7: red.red7,
          8: red.red8,
          9: red.red9,
          10: red.red10,
          11: red.red11,
          12: red.red12,
        },
        "danger-dark": {
          1: redDark.red1,
          2: redDark.red2,
          3: redDark.red3,
          4: redDark.red4,
          5: redDark.red5,
          6: redDark.red6,
          7: redDark.red7,
          8: redDark.red8,
          9: redDark.red9,
          10: redDark.red10,
          11: redDark.red11,
          12: redDark.red12,
        },
        info: {
          1: blue.blue1,
          2: blue.blue2,
          3: blue.blue3,
          4: blue.blue4,
          5: blue.blue5,
          6: blue.blue6,
          7: blue.blue7,
          8: blue.blue8,
          9: blue.blue9,
          10: blue.blue10,
          11: blue.blue11,
          12: blue.blue12,
        },
        "info-dark": {
          1: blueDark.blue1,
          2: blueDark.blue2,
          3: blueDark.blue3,
          4: blueDark.blue4,
          5: blueDark.blue5,
          6: blueDark.blue6,
          7: blueDark.blue7,
          8: blueDark.blue8,
          9: blueDark.blue9,
          10: blueDark.blue10,
          11: blueDark.blue11,
          12: blueDark.blue12,
        },
        warning: {
          1: yellow.yellow1,
          2: yellow.yellow2,
          3: yellow.yellow3,
          4: yellow.yellow4,
          5: yellow.yellow5,
          6: yellow.yellow6,
          7: yellow.yellow7,
          8: yellow.yellow8,
          9: yellow.yellow9,
          10: yellow.yellow10,
          11: yellow.yellow11,
          12: yellow.yellow12,
        },
        "warning-dark": {
          1: yellowDark.yellow1,
          2: yellowDark.yellow2,
          3: yellowDark.yellow3,
          4: yellowDark.yellow4,
          5: yellowDark.yellow5,
          6: yellowDark.yellow6,
          7: yellowDark.yellow7,
          8: yellowDark.yellow8,
          9: yellowDark.yellow9,
          10: yellowDark.yellow10,
          11: yellowDark.yellow11,
          12: yellowDark.yellow12,
        },
        success: {
          1: green.green1,
          2: green.green2,
          3: green.green3,
          4: green.green4,
          5: green.green5,
          6: green.green6,
          7: green.green7,
          8: green.green8,
          9: green.green9,
          10: green.green10,
          11: green.green11,
          12: green.green12,
        },
        "success-dark": {
          1: greenDark.green1,
          2: greenDark.green2,
          3: greenDark.green3,
          4: greenDark.green4,
          5: greenDark.green5,
          6: greenDark.green6,
          7: greenDark.green7,
          8: greenDark.green8,
          9: greenDark.green9,
          10: greenDark.green10,
          11: greenDark.green11,
          12: greenDark.green12,
        },
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
          primary: "#5364FF",
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
          "base-100": "white",
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
          primary: "#5364FF",
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
