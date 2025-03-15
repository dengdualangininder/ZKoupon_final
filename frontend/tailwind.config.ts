/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      height: {
        screendvh: "100dvh",
      },
      transitionDuration: {
        1500: "1500ms",
        2000: "2000ms",
        3000: "3000ms",
      },
      transitionDelay: {
        200: "200ms",
        400: "400ms",
        600: "600ms",
        1500: "1500ms",
      },
      colors: {
        light1: "#F9F9F9", // off-white
        light2: "#EEF3F7", // slate-125
        light3: "#E2E8F0", // slate-200
        light4: "#CBD5E1", // slate-300
        light5: "#B0BDCD", // slate-350
        lightButton: "#000000",
        lightButtonHover: "#334155", // slate-700
        lightText0: "#F9F9F9", // off-white
        lightText1: "#212427", // very dark gray-blue text
        lightText2: "#94A3B8",
        dark1: "#000000",
        dark2: "#111114",
        dark3: "#1A1A1F",
        dark4: "#222127",
        dark5: "#2E2D35",
        dark6: "#35343B",
        darkButton: "#5370A7",
        darkButtonHover: "#6983B2",
        darkText1: "#E2E8F0", // slate-200
        darkText2: "#00C2FF",
        darkText3: "#6A6D73",
        darkText4: "#53565C",
        dark0: "#9795A5",
        light0: "#9795A5",
        background: "#9795A5",
        primary: "#9795A5",
        buttonDark: "#9795A5",
        buttonDark2: "#9795A5",
        buttonLight1: "#9795A5",
        buttonLight2: "#9795A5",
        bggrayone: "#F5F5F7",
        darkblue: "#140D6F",
        darkbluelight: "#2A21A4",
        bggraytwo: "#F6F9FC",
        brightblue: "#635BFF",
        purple: "#6554AF",
        ethpurple: "#636890",
        grad1: "#F46F69",
        grad2: "#D675B0",
        grad3: "#9396DA",
        "slate-250": "#D5DDE7",
      },
      fontFamily: {
        nunito: ["Nunito Sans", "sans-serif"],
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out forwards",
        slideOut: "slideOut 0.3s ease-out forwards",
        fadeInAnimation: "fadeInAnimation ease 3s 1",
        flashText: "flashText 6s infinite",
        cexText: "cexText 6s infinite",
        bankText: "bankText 6s infinite",
        flashSolid: "flashSolid 6s infinite",
        cexSolid: "cexSolid 6s infinite",
        bankSolid: "bankSolid 6s infinite",
        flashOutline: "flashOutline 6s infinite",
        cexOutline: "cexOutline 6s infinite",
        bankOutline: "bankOutline 6s infinite",
        arrow: "arrow 6s linear infinite",
        usdc: "usdc 6s linear infinite",
        fiat: "fiat 6s linear infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        flashSolid: {
          "0%, 80%, 100%": {
            opacity: "0",
            translate: "0px 0px",
          },
          "7%, 73%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.9",
          },
        },
        cexSolid: {
          "0%, 15%, 80%, 100%": {
            opacity: "0",
          },
          "22%, 73%": {
            opacity: "1",
          },
          "0%, 20%": { rotate: "0deg" },
          "28%": {
            rotate: "180deg",
          },
          "29%, 80%": {
            rotate: "180deg",
          },
        },
        bankSolid: {
          "0%, 41%, 80%, 100%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "48%, 73%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.9",
          },
        },
        flashOutline: {
          "0%, 80%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "7%, 73%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        cexOutline: {
          "0%, 15%, 80%, 100%": {
            opacity: "1",
            scale: "1",
          },
          "22%, 73%": {
            opacity: "0",
            scale: "0.8",
          },
        },
        bankOutline: {
          "0%, 41%, 80%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "48%, 73%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        flashText: {
          "0%, 80%, 100%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "7%, 73%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        cexText: {
          "0%, 14%, 80%, 100%": {
            opacity: "0",
            scale: "1",
            translate: "0px 0px",
          },
          "21%, 73%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        bankText: {
          "0%, 41%, 80%, 100%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "48%, 73%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        arrow: {
          "0%, 7%": {
            width: "0px",
            opacity: "1",
          },
          "41%, 73%": {
            width: "100%",
            opacity: "1",
          },
          "80%, 100%": {
            width: "100%",
            opacity: "0",
          },
        },
        usdc: {
          "0%, 7%": {
            opacity: "1",
            left: "0%",
          },
          "21%": {
            opacity: "1",
          },
          "24%": {
            left: "42%",
          },
          "24%, 100%": {
            opacity: "0",
            left: "42%",
          },
        },
        fiat: {
          "0%, 18%, 21%": {
            opacity: "0",
            left: "40%",
          },
          "24%": {
            opacity: "1",
          },
          "40%, 73%": {
            opacity: "1",
            left: "82%",
          },
          "78%, 100%": {
            opacity: "0",
            left: "82%",
          },
        },
        fadeInAnimation: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
    },
    screens: {
      xs: "480px",
      sm: "600px",
      md: "750px",
      lg: "940px",
      lgg: "1100px",
      xl: "1250px",
      xxl: "1440px",
    },
  },
  darkMode: "class",
  plugins: [
    plugin(function ({ addUtilities, addComponents, e, config }) {
      addUtilities({
        ".backface-visible": {
          "backface-visibility": "visible",
        },
        ".backface-hidden": {
          "backface-visibility": "hidden",
        },
      });
    }),
    plugin(function ({ addVariant }) {
      addVariant("desktop", ["@media (hover: hover)", "@media (pointer: fine)"]);
    }),
  ],
};
