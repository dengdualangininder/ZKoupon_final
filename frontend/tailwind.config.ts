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
      animation: {
        nullaText: "nullaText 6s infinite",
        cexText: "cexText 6s infinite",
        bankText: "bankText 6s infinite",
        nullaSolid: "nullaSolid 6s infinite",
        cexSolid: "cexSolid 6s infinite",
        bankSolid: "bankSolid 6s infinite",
        nullaOutline: "nullaOutline 6s infinite",
        cexOutline: "cexOutline 6s infinite",
        bankOutline: "bankOutline 6s infinite",
        arrow: "arrow 6s linear infinite",
        usdc: "usdc 6s linear infinite",
        fiat: "fiat 6s linear infinite",
      },
      keyframes: {
        nullaOutline: {
          "0%, 80%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "10%, 73%": {
            opacity: "0",
            translate: "0px -8px",
            scale: "0.9",
          },
        },
        nullaSolid: {
          "0%, 80%, 100%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "10%, 73%": {
            opacity: "1",
            translate: "0px -8px",
            scale: "0.9",
          },
        },
        nullaText: {
          "0%, 80%, 100%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "10%, 73%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
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
            translate: "0px -8px",
            scale: "0.9",
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
            translate: "0px -8px",
            scale: "0.9",
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
        cexOutline: {
          "0%, 15%, 80%, 100%": {
            opacity: "1",
            scale: "1",
          },
          "22%, 73%": {
            opacity: "0",
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
      },
    },
  },
  darkMode: "selector",
  plugins: [
    // plugin(function ({ addUtilities }) {
    //   addUtilities({
    //     ".backface-visible": {
    //       "backface-visibility": "visible",
    //     },
    //     ".backface-hidden": {
    //       "backface-visibility": "hidden",
    //     },
    //   });
    // }),
    plugin(function ({ addVariant }) {
      addVariant("desktop", ["@media (hover: hover)", "@media (pointer: fine)"]);
    }),
    require("@tailwindcss/forms"),
  ],
};
