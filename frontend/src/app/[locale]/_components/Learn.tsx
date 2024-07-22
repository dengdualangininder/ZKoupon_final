"use client";
import { useState } from "react";
import Image from "next/image";
// others
import { useTranslations } from "next-intl";
// constants
import { currencyToData } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

const Learn = ({ merchantCurrency }: { merchantCurrency: string }) => {
  const [lesson, setLesson] = useState("");

  //hooks
  const t = useTranslations("HomePage.Learn");
  const tcommon = useTranslations("HomePage.Common");

  const titles = [
    { id: "lesson1", title: `${t("lesson")} 1`, subtitle: t("title1"), color: "4285f4" },
    { id: "lesson2", title: `${t("lesson")} 2`, subtitle: t("title2"), color: "34a853" },
    { id: "lesson3", title: `${t("lesson")} 3`, subtitle: t("title3"), color: "fbbc05" },
    { id: "lesson4", title: `${t("lesson")} 4`, subtitle: t("title4"), color: "ea4335" },
    { id: "lesson5", title: `${t("lesson")} 5`, subtitle: t("title5"), color: "000000" },
  ];

  const learnContent: any = {
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
            merchantCurrency: merchantCurrency,
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
        {merchantCurrency != "USD" && (
          <div className="relative">
            {t.rich("lesson-5-2", {
              span1: (chunks: any) => <span className="group">{chunks}</span>,
              span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
              div: (chunks: any) => <span className="w-full bottom-[26px] left-0 learnTooltip">{chunks}</span>,
              merchantCurrency: merchantCurrency,
              tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: merchantCurrency }),
            })}
          </div>
        )}
        <div>
          {currencyToData[merchantCurrency].cex == "Coinbase" && <span>{t("lesson-5-3")}</span>}
          {t("lesson-5-4")}
        </div>
        <div>{t("lesson-5-5")}</div>
      </div>
    ),
  };

  return (
    <div id="learnEl" className="homeSectionSize xl:w-[840px] flex flex-col items-center">
      <div className="homeHeaderFont text-center">{t("header")}</div>
      <div className="mt-2 mb-8 md:mb-12 text-lg font-medium text-center sm:w-[440px] lg:w-auto">{t("subheader")}</div>
      <div className="w-full flex flex-col ">
        {titles.map((i, index) => (
          <div className={`${index == 0 ? "border-t-2" : ""} border-b-2 border-slate-300`}>
            {/*--- TITLE ---*/}
            <div
              className={`py-3 w-full flex justify-between items-center cursor-pointer desktop:hover:bg-[#1D364F]`}
              onClick={() => (lesson == i.id ? setLesson("") : setLesson(i.id))}
            >
              {/*---content ---*/}
              <div className="flex flex-col items-start">
                <div className="text-base font-semibold leading-none py-2 px-3 rounded-lg" style={{ backgroundColor: `#${i.color}` }}>
                  {i.title}
                </div>
                <div className="mt-2 text-lg leading-none">{i.subtitle}</div>
              </div>
              {/*--- learn/arrow (right) ---*/}
              <div className="mr-2">
                {lesson == i.id ? (
                  <FontAwesomeIcon icon={faAngleUp} className="text-xl ml-2" />
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faAngleDown} className="text-xl ml-2" />
                  </span>
                )}
              </div>
            </div>
            {/*--- CONTENT ---*/}
            <div
              className={`${
                lesson == i.id ? "max-h-[1300px] sm:max-h-[650px]" : "max-h-0"
              } text-sm xs:text-base leading-tight xs:leading-tight overflow-hidden transition-all duration-[600ms]`}
            >
              {learnContent[i.id]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
