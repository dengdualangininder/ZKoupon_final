"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
// other
import { useTranslations } from "next-intl";
// constants
import { currencyList } from "@/utils/constants";

const How = ({ merchantCurrency, setMerchantCurrency }: { merchantCurrency: string; setMerchantCurrency: any }) => {
  // hooks
  const router = useRouter();
  const t = useTranslations("HomePage.How");
  const tcommon = useTranslations("Common");

  return (
    <div className="w-full flex flex-col items-center py-[64px]">
      {/*--- header + select currency ---*/}
      <div data-show="yes" className="opacity-0 transition-all duration-1000">
        {/*--- header ---*/}
        <div className="homeHeaderFont text-center">{t("header")}</div>
        {/*--- select currency ---*/}
        <div className="my-[48px] pb-[16px] w-full flex flex-col sm:flex-row justify-center items-center">
          <label className="sm:mr-3 howHeader1Font">{t("selectCurrency")}: </label>
          <select
            className="mt-4 sm:mt-0 h-[44px] sm:h-[36px] py-0 font-medium pr-10 text-xl sm:text-base leading-none border bg-dark6 border-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors duration-500 rounded-md"
            onChange={async (e) => {
              const merchantCurrencyTemp = e.target.value;
              setMerchantCurrency(merchantCurrencyTemp);
            }}
            value={merchantCurrency}
          >
            {currencyList.map((i, index) => (
              <option key={index}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/*--- STEPS ---*/}
      <div
        data-show="slide"
        className="sm:w-[90%] sm:min-w-[588px] md:min-w-[720px] md:max-w-[820px] lg:min-w-[920px] xl:desktop:w-full xl:desktop:max-w-[1240px] grid grid-cols-[350px] sm:grid-cols-[280px_280px] md:grid-cols-[350px_350px] lg:grid-cols-[400px_400px] xl:desktop:grid-cols-[222px_280px_280px_280px] justify-center sm:justify-between gap-y-16 sm:gap-y-10 lg:gap-y-16 xl:desktop:gap-x-10"
      >
        {/*---step 1---*/}
        <div data-show="step" className="w-full xl:desktop:w-[222px] flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4">
          {/*---title---*/}
          <div className="w-full h-[64px] flex items-center">
            <div className="howNumber">1</div>
            <div className="howStepTitle">{t("step-1")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-[180px] h-[260px] sm:h-[368px]">
            <Image src={"/placardNoCashback.png"} alt="placardNoCashback" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="howBulletPoints">
            {t("step-1-1")} (
            <span className="linkDark" onClick={() => router.push("/app")}>
              {t("setup")}
            </span>
            )
          </div>
        </div>

        {/*---Step 2---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-200">
          {/*---title---*/}
          <div className="w-full h-[64px] flex items-center">
            <div className="howNumber">2</div>
            <div className="howStepTitle">{t("step-2")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phonePay.png"} alt="phonePay" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="howBulletPoints">
            <div className="flex relative">
              <div className="mr-2.5">1.</div>
              <div className="">
                {t.rich("step-2-1", {
                  span1: (chunks: any) => <span className="group">{chunks}</span>,
                  sup: (chunks: any) => <sup>{chunks}</sup>,
                  span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
                  div: (chunks: any) => <div className="w-full bottom-[calc(100%+4px)] left-0 tooltip">{chunks}</div>,
                  tooltip: tcommon("mmTooltip"),
                })}
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-2">2.</div>
              <div className="">{t("step-2-2", { merchantCurrency: merchantCurrency })}</div>
            </div>
            <div className="flex relative">
              <div className="mr-2">3.</div>
              <div>
                {t.rich("step-2-3", {
                  span1: (chunks: any) => <span className="group">{chunks}</span>,
                  sup: (chunks: any) => <sup>{chunks}</sup>,
                  span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
                  div: (chunks: any) => <div className="bottom-[calc(100%+8px)] left-0 tooltip">{chunks}</div>,
                  span3: (chunks: any) => <span className={`${merchantCurrency == "USD" ? "hidden" : ""}`}>{chunks}</span>,
                  merchantCurrency: merchantCurrency,
                  tooltip: tcommon("usdcTooltip"),
                })}
              </div>
            </div>
          </div>
        </div>

        {/*---step 3---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-400">
          {/*---title---*/}
          <div className="w-full h-[64px] flex items-center">
            <div className="howNumber">3</div>
            <div className="howStepTitle">{t("step-3")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneConfirmPayment.png"} alt="phoneConfirmPayment" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---image and bullet points---*/}
          <div className="howBulletPoints">
            <div>{t("step-3-1")}</div>
          </div>
        </div>

        {/*---step 4---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-600">
          {/*---title---*/}
          <div className="w-full h-[64px] flex items-center">
            <div className="howNumber">4</div>
            <div className="howStepTitle">{t("step-4")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneCashOut.png"} alt="phoneCashOut" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="howBulletPoints">
            {/*--- USD & EUR ---*/}
            {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
              <div className="space-y-2">
                <div>
                  {t("step-4-1cb")} (
                  <span className="linkDark">
                    <a href="https://www.coinbase.com/signup" target="_blank">
                      {t("signup")}
                    </a>
                  </span>
                  )
                </div>
                <div className="flex">
                  <div className="mr-2.5">1.</div>
                  <div>{t("step-4-2cb")}</div>
                </div>
                <div className="flex">
                  <div className="mr-2">2.</div>
                  <div>
                    {t.rich("step-4-3cb", {
                      span: (chunks: any) => <span className={`${merchantCurrency == "USD" ? "" : "hidden"}`}>{chunks}</span>,
                      merchantCurrency: merchantCurrency,
                    })}
                  </div>
                </div>
              </div>
            )}
            {/*--- TWD ---*/}
            {merchantCurrency == "TWD" && (
              <div className="howBulletPoints">
                <div>
                  {t.rich("step-4-1", {
                    a: (chunks: any) => (
                      <a href="https://apps.apple.com/tw/app/max-%E8%99%9B%E6%93%AC%E8%B2%A8%E5%B9%A3%E4%BA%A4%E6%98%93%E6%89%80/id1370837255" target="_blank" className="linkDark">
                        {chunks}
                      </a>
                    ),
                  })}
                </div>
                <div className="flex">
                  <div className="mr-2.5">1.</div>
                  <div>{t("step-4-2")}</div>
                </div>
                <div className="flex">
                  <div className="mr-2">2.</div>
                  <div>{t("step-4-3")}</div>
                </div>
              </div>
            )}
            {/*--- non-USD ---*/}
            {merchantCurrency != "USD" && (
              <div className="flex relative">
                <div className="mr-2">&nbsp;&nbsp;{`\u20F0`}&nbsp;</div>
                <div className="">
                  {t.rich("step-4-notUSD", {
                    span1: (chunks: any) => <span className="group">{chunks}</span>,
                    span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
                    span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                    div: (chunks: any) => <div className="w-full bottom-[calc(100%+4px)] left-0 tooltip whitespace-normal">{chunks}</div>,
                    tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: merchantCurrency }),
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default How;
