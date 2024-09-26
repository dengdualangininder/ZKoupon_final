"use client";
import { useState, useLayoutEffect } from "react";
// others
import { useTranslations } from "next-intl";
// constants
import { currencyToData } from "@/utils/constants";
// images
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

const Learn = ({ merchantCurrency }: { merchantCurrency: string | undefined }) => {
  const [lesson, setLesson] = useState("");
  const [heights, setHeights] = useState<number[]>([1350, 1350, 1350, 1350, 1350]);

  //hooks
  const t = useTranslations("HomePage.Learn");
  const tcommon = useTranslations("Common");

  useLayoutEffect(() => {
    console.log("useLayoutEffect run once");
    const elements = document.querySelectorAll<HTMLElement>(".learnAnswerContainer");
    let heightsTemp: number[] = [];
    elements?.forEach((i) => {
      heightsTemp.push(i.offsetHeight);
    });
    setHeights(heightsTemp);
  }, []);

  const titles = [
    { id: "lesson1", title: `${t("lesson")} 1`, subtitle: t("title1"), color: "4285f4" },
    { id: "lesson2", title: `${t("lesson")} 2`, subtitle: t("title2"), color: "34a853" },
    { id: "lesson3", title: `${t("lesson")} 3`, subtitle: t("title3"), color: "fbbc05" },
    { id: "lesson4", title: `${t("lesson")} 4`, subtitle: t("title4"), color: "ea4335" },
    { id: "lesson5", title: `${t("lesson")} 5`, subtitle: t("title5"), color: "000000" },
  ];

  const learnContent: { [key: string]: React.ReactNode } = {
    lesson1: (
      <div className="learnAnswerContainer">
        <div>{t.rich("lesson-1-1", { span: (chunks: any) => <span className="learnBoldFont">{chunks}</span> })}</div>
        <div>{t("lesson-1-2")}</div>
        <div>
          {t.rich("lesson-1-3", {
            span1: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
            span2: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
          })}
        </div>
        <div>
          {t.rich("lesson-1-4", {
            span: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
          })}
        </div>
      </div>
    ),
    lesson2: (
      <div className="learnAnswerContainer">
        <div>
          {t.rich("lesson-2", {
            span1: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
            span2: (chunks: any) => <span className="break-all">{chunks}</span>,
          })}
        </div>
      </div>
    ),
    lesson3: (
      <div className="learnAnswerContainer">
        <div>{t("lesson-3-1")}</div>
        <div>{t("lesson-3-2")}</div>
      </div>
    ),
    lesson4: (
      <div className="learnAnswerContainer">
        <div>
          {t.rich("lesson-4-1", {
            span: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
            merchantCurrency: merchantCurrency ?? "USD",
          })}
        </div>
        <div>
          {t.rich("lesson-4-2", {
            span: (chunks: any) => <span className="learnBoldFont">{chunks}</span>,
          })}
        </div>
        <div>{t("lesson-4-3")}</div>
        <div>{t("lesson-4-4")}</div>
      </div>
    ),
    lesson5: (
      <div className="learnAnswerContainer">
        <div>{t("lesson-5-1")}</div>
        {merchantCurrency && merchantCurrency != "USD" && (
          <div className="relative">
            {t.rich("lesson-5-2", {
              span1: (chunks: any) => <span className="group">{chunks}</span>,
              span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
              div: (chunks: any) => <span className="w-full bottom-[26px] left-0 tooltip">{chunks}</span>,
              merchantCurrency: merchantCurrency,
              tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: merchantCurrency }),
            })}
          </div>
        )}
        <div>
          {currencyToData[merchantCurrency ?? "USD"].cex == "Coinbase" && <span>{t("lesson-5-3")}</span>}
          {t("lesson-5-4")}
        </div>
        <div>{t("lesson-5-5")}</div>
      </div>
    ),
  };

  console.log(heights);

  return (
    <div className="pt-[80px] pb-[96px] homeSectionSize max-w-[800px] flex flex-col items-center">
      <div className="homeHeaderFont">{t("header")}</div>
      <div className="mt-2 mb-8 md:mb-12 text-lg font-medium">{t("subheader")}</div>
      <div className="w-full flex flex-col">
        {titles.map((i, index) => (
          <div key={i.id} className={`${index == 0 ? "border-t-2" : ""} border-b-2 border-slate-300`}>
            {/*--- QUESTION ---*/}
            <div
              className="px-[4px] py-[12px] flex justify-between items-center desktop:cursor-pointer desktop:hover:bg-[#1D364F]"
              onClick={() => (lesson == i.id ? setLesson("") : setLesson(i.id))}
            >
              {/*--- text ---*/}
              <div className="flex flex-col items-start xs:flex-row xs:items-center gap-1 xs:gap-4">
                <div className="text-base font-semibold py-[4px] px-[16px] rounded-full" style={{ backgroundColor: `#${i.color}` }}>
                  {i.title}
                </div>
                <div className="text-lg">{i.subtitle}</div>
              </div>
              {/*--- angle down/up ---*/}
              <FaAngleDown className={`${i.id == lesson ? "rotate-180" : "rotate-0"} [transition:transform_300ms] text-xl`} />
            </div>
            {/*--- ANSWER ---*/}
            {/* <div
              style={{ maxHeight: lesson == i.id ? `${heights[index] + 16}px` : "0px", transition: `max-height ${heights[index] * 1.3}ms` }}
              className={`overflow-hidden ease-out`}
            > */}
            {/* <div className={`${lesson == i.id ? "max-h-[1350px]" : "max-h-0"} overflow-hidden [transition:max-height_500ms]`}> */}
            <div
              style={{ transition: `grid ${heights[index] * 1.3}ms, opacity 500ms` }}
              className={`${lesson == i.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} grid`}
            >
              <div className="overflow-hidden">{learnContent[i.id]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
