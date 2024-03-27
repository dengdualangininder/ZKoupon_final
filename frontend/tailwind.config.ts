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
        primary: "#DFE8F8",
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
      },
      fontFamily: {
        nunito: ["Nunito Sans", "sans-serif"],
      },
      animation: {
        text: "text 7s ease infinite",
        textTwo: "textTwo 2s ease infinite",
        textThree: "text 5s ease infinite",
        bounceTwo: "bounceTwo 7s infinite",
        blob: "blob 3s infinite",
        blob2: "blob2 1s infinite",
        blob3: "blob3 3s infinite",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center left",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center right",
          },
        },
        textTwo: {
          "0%": {
            "background-size": "700% 700%",
            "background-position": "0% 50%",
          },
          "50%": {
            "background-size": "700% 700%",
            "background-position": "100% 50%",
          },
          "100%": {
            "background-size": "700% 700%",
            "background-position": "0% 50%",
          },
        },

        blob: {
          "0%": {
            transform: "translate(0px, 20px) scale(1)",
          },
          "50%": {
            transform: "translate(0px, -20px) scale(1)",
          },
          "100%": {
            transform: "translate(0px, 20px) scale(1)",
          },
        },
        blob2: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        blob3: {
          "0%": {
            transform: "translate(0px, 50px) scale(0.2)",
          },
          // "50%": {
          //   transform: "translate(0px, -100px) scale(1)",
          // },
          // "100%": {
          //   transform: "translate(0px, 100px) scale(1)",
          // },
        },
        bounceTwo: {
          "0%, 60%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "68%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "72%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "76%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "80%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "84%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "88%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "92%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
          "96%": {
            transform: "translateY(-25%)",
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
          },
          "100%": {
            transform: "translateY(0)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
    },
    screens: {
      xs: "480px",
      sm: "600px",
      md: "900px",
      lg: "1200px",
      xl: "1400px",
    },
  },
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
  ],
};
