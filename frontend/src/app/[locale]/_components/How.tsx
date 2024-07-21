"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
// other
import { useTranslations } from "next-intl";
// constants
import { currencyList } from "@/utils/constants";

const How = ({ merchantCurrency, setMerchantCurrency }: { merchantCurrency: string; setMerchantCurrency: any }) => {
  // hooks
  const router = useRouter();
  const t = useTranslations("HomePage.How");

  return (
    <div id="howEl" className="w-full flex flex-col items-center py-16">
      {/*--- header + select currency ---*/}
      <div data-show="yes" className="opacity-0 transition-all duration-1000">
        {/*--- header ---*/}
        <div className="homeHeaderFont text-center">{t("title")}</div>
        {/*--- select currency ---*/}
        <div className="my-12 pb-4 w-full flex flex-col sm:flex-row justify-center items-center">
          <label className="sm:mr-3 howHeader2Font">{t("selectCurrency")}: </label>
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
          <div className="w-full flex items-center">
            <div className="howNumber">1</div>
            <div className={`howStepTitle`}>{t("step-1")}</div>
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
          <div className="w-full flex items-center">
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
                  div: (chunks: any) => <div className="w-full bottom-[calc(100%+4px)] left-0 howTooltip">{chunks}</div>,
                })}
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-2">2.</div>
              <div className="">
                The customer <span className="font-semibold">enters the amount of {merchantCurrency} for payment</span>
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-2">3.</div>
              <div>
                When the customer submits payment,{" "}
                <span className="group">
                  <span className="linkDark">
                    USDC tokens<sup>?</sup>
                  </span>
                  <div className="bottom-[calc(100%+8px)] left-0 howTooltip">1 USDC token equals to 1 USD, as gauranteed by Circle. Almost all crypto users have USDC.</div>
                </span>{" "}
                {merchantCurrency == "USD" ? "" : <span>&#40;with a value equal to the amount of {merchantCurrency} entered&#41;</span>} will be sent from their MetaMask to your
                Flash app
              </div>
            </div>
          </div>
        </div>

        {/*---step 3---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-400">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="howNumber">3</div>
            <div className="howStepTitle">{t("step-3")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneConfirmPayment.png"} alt="phoneConfirmPayment" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---image and bullet points---*/}
          <div className="howBulletPoints">
            <div>
              About 5 seconds after a customer pays, you should see the payment in the Flash app. Employees can also log into your Flash app (with restricted functions) on a shared
              or personal device to see successful payments
            </div>
          </div>
        </div>

        {/*---step 4---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-600">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="howNumber">4</div>
            <div className="howStepTitle">{t("step-4")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneCashOut.png"} alt="phoneCashOut" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="howBulletPoints">
            {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
              <div>
                To transfer funds to your bank, you must have a Coinbase account (
                <span className="linkDark">
                  <a href="https://www.coinbase.com/signup" target="_blank">
                    sign up here
                  </a>
                </span>
                )
              </div>
            )}
            {merchantCurrency == "TWD" && (
              <div>
                To transfer funds to your bank, you must have a MAX Exchange account (
                <span className="linkDark">
                  <a href="https://max.maicoin.com/signup" target="_blank">
                    sign up here
                  </a>
                </span>
                )
              </div>
            )}
            <div className="flex">
              <div className="mr-2.5">1.</div>
              <div className="">
                {(merchantCurrency == "USD" || merchantCurrency == "EUR") && <div>In the Flash app, click "Link Coinbase Account"</div>}
                {merchantCurrency == "TWD" && <div>Copy your MAX account's USDC deposit address (for Polygon) and paste it in the "Settings" menu of the Flash app</div>}
              </div>
            </div>
            <div className="flex">
              <div className="mr-2">2.</div>
              <div className="">
                {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
                  <div>
                    Click "Cash Out" and follow the on-screen instructions. USDC will be automatically converted to {merchantCurrency == "USD" ? "USD at a 1:1 rate" : "EUR*"} and
                    the money sent to your bank (~0% fees)
                  </div>
                )}
                {merchantCurrency == "TWD" && <div>In the "Cash Out" menu, click "Transfer to MAX"</div>}
              </div>
            </div>

            {merchantCurrency == "TWD" && (
              <div className="flex">
                <div className="mr-2">3.</div>
                <div>Log into your MAX account. Sell USDC for TWD* and withdraw the money to your bank.</div>
              </div>
            )}

            {merchantCurrency != "USD" && (
              <div className="flex relative">
                <div className="mr-2">&nbsp;*</div>
                <div className="">
                  Flash is designed so that you will not lose money from fluctuating exchange rates (
                  <span className="group">
                    <span className="linkDark">how?</span>
                    <div className="w-full bottom-[calc(100%+4px)] left-0 howTooltip">
                      When a customer pays, our interface alters the USDC-{merchantCurrency} rate by 0.3% in favor of the business. So, you actually earn an extra 0.3%. In the long
                      run, these extra earnings should offset any losses due to fluctuating rates, if you cash out frequently (~2x per month). Customers will not mind the extra
                      0.3% because the USDC-to-{merchantCurrency} rate offered by Flash is usually 1-5% better than the USD-to-{merchantCurrency} rate at any bank.
                    </div>
                  </span>
                  )
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
