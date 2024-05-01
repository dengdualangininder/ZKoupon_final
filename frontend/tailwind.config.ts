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
        grayblue: "#F6F9FC",
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
        fadeInAnimation: "fadeInAnimation ease 3s 1",
        text: "text 7s ease infinite",
        textTwo: "textTwo 2s ease infinite",
        textThree: "text 5s ease infinite",
        bounceTwo: "bounceTwo 7s infinite",
        blob: "blob 3s infinite",
        blob2: "blob2 1s infinite",
        blob3: "blob3 3s infinite",
        metamaskBox: "metamaskBox 8s infinite",
        flashBox: "flashBox 8s infinite",
        cexBox: "cexBox 8s infinite",
        bankBox: "bankBox 8s infinite",
        metamaskText: "metamaskText 8s infinite",
        flashText: "flashText 8s infinite",
        cexText: "cexText 8s infinite",
        bankText: "bankText 8s infinite",
        metamaskSolid: "metamaskSolid 8s infinite",
        flashSolid: "flashSolid 8s infinite",
        cexSolid: "cexSolid 8s infinite",
        bankSolid: "bankSolid 8s infinite",
        metamaskOutline: "metamaskOutline 8s infinite",
        flashOutline: "flashOutline 8s infinite",
        cexOutline: "cexOutline 8s infinite",
        bankOutline: "bankOutline 8s infinite",
        arrowRight: "arrowRight 8s ease-in infinite",
        arrowDown: "arrowDown 8s ease-in infinite",
        arrowLeft: "arrowLeft 8s ease-in infinite",
        usdc1: "usdc1 8s ease-in infinite",
        usdc2: "usdc2 8s ease-in infinite",
        fiat: "fiat 8s ease-in infinite",
      },
      keyframes: {
        metamaskBox: {
          "27%, 93%": {
            "background-color": "white",
            filter: "drop-shadow(0px 0px 0px #ffffff)",
            transform: "scale(1)",
          },
          "100%, 0%, 20%": {
            "background-color": "#F6F9FC",
            filter: "drop-shadow(6px 6px 6px #d1d5db)",
            transform: "scale(1.2)",
          },
        },
        flashBox: {
          "0%, 7%, 52%, 100%": {
            "background-color": "white",
            filter: "drop-shadow(0px 0px 0px #ffffff)",
            transform: "scale(1)",
          },
          "14%, 45%": {
            "background-color": "#F6F9FC",
            filter: "drop-shadow(6px 6px 6px #d1d5db)",
            transform: "scale(1.2)",
          },
        },
        cexBox: {
          "0%, 32%, 77%, 100%": {
            "background-color": "white",
            filter: "drop-shadow(0px 0px 0px #ffffff)",
            transform: "scale(1)",
          },
          "39%, 70%": {
            "background-color": "#F6F9FC",
            filter: "drop-shadow(6px 6px 6px #d1d5db)",
            transform: "scale(1.2)",
          },
        },
        bankBox: {
          "91%, 0%, 57%, 100%": {
            "background-color": "white",
            filter: "drop-shadow(0px 0px 0px #ffffff)",
            transform: "scale(1)",
          },
          "64%, 84%": {
            "background-color": "#F6F9FC",
            filter: "drop-shadow(6px 6px 6px #d1d5db)",
            transform: "scale(1.2)",
          },
        },
        metamaskSolid: {
          "27%, 93%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "100%, 0%, 20%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        flashSolid: {
          "0%, 7%, 52%, 100%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "14%, 45%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        cexSolid: {
          "0%, 32%, 77%, 100%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "39%, 70%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        bankSolid: {
          "91%, 0%, 57%, 100%": {
            opacity: "0",
            translate: "0px 0px",
            scale: "1",
          },
          "64%, 84%": {
            opacity: "1",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        metamaskOutline: {
          "27%, 93%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "100%, 0%, 20%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        flashOutline: {
          "0%, 7%, 52%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "14%, 45%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        cexOutline: {
          "0%, 32%, 77%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "39%, 70%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        bankOutline: {
          "91%, 0%, 57%, 100%": {
            opacity: "1",
            translate: "0px 0px",
            scale: "1",
          },
          "64%, 84%": {
            opacity: "0",
            translate: "0px -12px",
            scale: "0.8",
          },
        },
        metamaskText: {
          "27%, 93%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "100%, 0%, 20%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        flashText: {
          "0%, 7%, 52%, 100%": {
            opacity: "0",
            scale: "1",
            translate: "0px 0px",
          },
          "14%, 45%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        cexText: {
          "0%, 32%, 77%, 100%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "39%, 70%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        bankText: {
          "91%, 0%, 57%, 100%": {
            opacity: "0",
            scale: "0.8",
            translate: "0px 0px",
          },
          "64%, 84%": {
            opacity: "1",
            scale: "1",
            translate: "0px -2px",
          },
        },
        arrowRight: {
          "0%": {
            translate: "0px 0px",
            opacity: "1",
          },
          "7%, 18%": {
            translate: "80px 0px",
            opacity: "1",
          },
          "25%, 100%": {
            translate: "160px 0px",
            opacity: "0",
          },
        },
        arrowDown: {
          "0%, 25%": {
            translate: "0px 0px",
            opacity: "1",
          },
          "32%, 43%": {
            translate: "0px 80px",
            opacity: "1",
          },
          "50%, 100%": {
            translate: "0px 160px",
            opacity: "0",
          },
        },
        arrowLeft: {
          "0%, 50%": {
            translate: "0px 0px",
            opacity: "1",
          },
          "57%, 68%": {
            translate: "-80px 0px",
            opacity: "1",
          },
          "75%, 100%": {
            translate: "-160px 0px",
            opacity: "0",
          },
        },
        usdc1: {
          "0%, 25%, 100%": {
            opacity: "0",
          },
          "7%, 18%": {
            opacity: "1",
          },
        },
        usdc2: {
          "0%, 25%, 50%, 100%": {
            opacity: "0",
          },
          "32%, 43%": {
            opacity: "1",
          },
        },
        fiat: {
          "0%, 50%, 75%, 100%": {
            opacity: "0",
          },
          "57%, 68%": {
            opacity: "1",
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
      md: "750px",
      lg: "1000px",
      xl: "1250px",
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
    plugin(function ({ addVariant }) {
      addVariant("desktop", ["@media (hover: hover)", "@media (pointer: fine)"]);
    }),
  ],
};
