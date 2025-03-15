"use client";
import { useEffect } from "react";

export default function Observer({ children }: { children: React.ReactNode }) {
  console.log("Observer.tsx");

  useEffect(() => {
    console.log("Observer.tsx useEffect");
    // obsever for sections fading in
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" } // default = root: null, threshold: 0
    );
    document.querySelectorAll("div[data-show='yes']").forEach((el) => observer.observe(el));

    // observer for steps sliding in
    const observerSlide = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll("div[data-show='step']").forEach((el) => el.classList.remove("translate-x-[1600px]"));
            observerSlide.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "-100px" }
    );
    document.querySelectorAll("div[data-show='slide']").forEach((el) => observerSlide.observe(el));

    // // observer for hero button translating up
    // const observerButton = new IntersectionObserver((entries) => {
    //   entries.forEach((entry) => {
    //     if (entry.isIntersecting) {
    //       document.querySelectorAll("div[id='animated-button']").forEach((el) => el.classList.remove("translate-x-[1600px]")); // even if one element, querySelectAll helps with TS
    //       observerSlide.unobserve(entry.target);
    //     }
    //   });
    // });
    // document.querySelectorAll("div[id='How']").forEach((el) => observerButton.observe(el)); // even if one element, querySelectAll helps with TS

    // // observer for hero button translating up
    // const observerButton = new IntersectionObserver((entries) => {
    //   entries.forEach((entry) => {
    //     if (entry.isIntersecting) {
    //       document.querySelectorAll("div[id='animated-button']").forEach((el) => el.classList.remove("translate-x-[1600px]")); // even if one element, querySelectAll helps with TS
    //       observerSlide.unobserve(entry.target);
    //     }
    //   });
    // });
    // document.querySelectorAll("div[id='How']").forEach((el) => observerButton.observe(el)); // even if one element, querySelectAll helps with TS
  }, []);
  return <div>{children}</div>;
}
