// nextjs
import Link from "next/link";
import Image from "next/image";
// i18n
import { useTranslations } from "next-intl";
// components
import HowClient from "./HowClient";

export default function How({ merchantCurrency }: { merchantCurrency: string | undefined }) {
  // hooks
  const t = useTranslations("HomePage.How");
  const tcommon = useTranslations("Common");

  return (
    <div className="pt-[80px] pb-[96px] w-full max-w-[1440px] flex flex-col items-center">
      {/*--- header + select currency ---*/}
      <div data-show="yes" className="opacity-0 transition-all duration-1000">
        {/*--- header ---*/}
        <div className="homeHeaderFont text-center">{t("header")}</div>
        {/*--- select currency ---*/}
        <div className="my-[48px] pb-[16px] w-full flex flex-col sm:flex-row justify-center items-center">
          <label className="sm:mr-3 howHeader1Font">{t("selectCurrency")}: </label>
          <HowClient merchantCurrency={merchantCurrency} />
        </div>
      </div>

      {/*--- STEPS ---*/}
      <div
        data-show="slide"
        className="mx-[12px] xs:mx-[24px] lg:mx-[32px] grid grid-cols-[minmax(auto,calc(600px-24px*2))] lg:grid-cols-[400px_400px] xl:grid-cols-[220px,repeat(3,300px)] justify-center lg:gap-x-[80px] xl:gap-x-[44px] gap-y-16 sm:gap-y-10 lg:gap-y-[64px]"
      >
        {/*---step 1---*/}
        <div data-show="step" className="w-full flex flex-col items-center space-y-4 translate-x-[1600px] transition-all duration-1500 ease-out">
          {/*---title---*/}
          <div className="flex items-center space-x-[16px]">
            <div className="howNumber">1</div>
            <div className="howStepTitle">{t("step-1")}</div>
          </div>
          {/*--- image ---*/}
          <div className="py-[8px] lg:h-[500px] xl:h-[400px] lg:aspect-[1/2] flex items-center">
            <div className="relative w-[300px] xl:w-[210px] aspect-[9/12]">
              <Image src={"/placardNoCashback.png"} alt="placard no cashback" sizes={"300px"} fill className="object-contain" />
            </div>
          </div>
          {/*---bullet points---*/}
          <div className="howBulletFont">
            {t.rich("step-1-1", {
              a1: (chunks) => (
                <Link className="linkDark" href={"/app"}>
                  {chunks}
                </Link>
              ),
            })}
          </div>
        </div>

        {/*---Step 2---*/}
        <div data-show="step" className="w-full flex flex-col items-center space-y-[16px] translate-x-[1600px] transition-all duration-1500 ease-out delay-200">
          {/*---title---*/}
          <div className="flex items-center space-x-[16px]">
            <div className="howNumber">2</div>
            <div className="howStepTitle">{t("step-2")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative h-[500px] desktop:h-[400px] aspect-[1/2]">
            <Image src={"/phonePay.png"} alt="Step 2 Payment" sizes={"260px"} fill className="object-contain" />
          </div>
          {/*---bullet points---*/}
          <div className="grid grid-cols-[auto,auto] gap-[8px] howBulletFont">
            <div>1.</div>
            <div className="relative">
              {t.rich("step-2-1", {
                span1: (chunks: any) => <span className="group">{chunks}</span>,
                sup: (chunks: any) => <sup>{chunks}</sup>,
                span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
                div: (chunks: any) => <div className="w-full bottom-[calc(100%+4px)] left-0 tooltip">{chunks}</div>,
                tooltip: tcommon("mmTooltip"),
              })}
            </div>
            <div>2.</div>
            <div>{t("step-2-2", { merchantCurrency: merchantCurrency })}</div>
            <div>3.</div>
            <div className="relative">
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

        {/*---step 3---*/}
        <div data-show="step" className="w-full flex flex-col items-center space-y-4 translate-x-[1600px] transition-all duration-1500 ease-out delay-400">
          {/*---title---*/}
          <div className="w-full flex items-center space-x-[16px]">
            <div className="howNumber">3</div>
            <div className="howStepTitle">{t("step-3")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative h-[500px] xl:h-[400px] aspect-[1/2]">
            <Image src={"/phoneConfirmPayment.png"} alt="Step 3 Confirm payment" sizes={"260px"} fill className="object-contain" />
          </div>
          {/*--- bullet points---*/}
          <div className="howBulletFont">{t("step-3-1")}</div>
        </div>

        {/*---step 4---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1600px] transition-all duration-1500 ease-out space-y-4 delay-600">
          {/*---title---*/}
          <div className="w-full flex items-center space-x-[16px]">
            <div className="howNumber">4</div>
            <div className="howStepTitle">{t("step-4")}</div>
          </div>
          {/*--- image ---*/}
          <div className="relative h-[500px] xl:h-[400px] aspect-[1/2]">
            <Image src={"/phoneCashOut.png"} alt="Step 4 Cash out" sizes={"260px"} fill className="object-contain" />
          </div>
          {/*---bullet points: USD & EUR---*/}
          {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
            <div className="grid grid-cols-[auto,auto] gap-[8px] howBulletFont">
              <div>1.</div>
              <div>
                {t("step-4-1cb")} (
                <span className="linkDark">
                  <a href="https://www.coinbase.com/signup" target="_blank">
                    {t("signup")}
                  </a>
                </span>
                )
              </div>
              <div>2.</div>
              <div>{t("step-4-2cb")}</div>
              <div>3.</div>
              <div>
                {t.rich("step-4-3cb", {
                  span: (chunks: any) => <span className={`${merchantCurrency == "USD" ? "" : "hidden"}`}>{chunks}</span>,
                  merchantCurrency: merchantCurrency,
                })}
              </div>
            </div>
          )}
          {/*--- bullet points: TWD ---*/}
          {merchantCurrency == "TWD" && (
            <div className="grid grid-cols-[auto,auto] gap-[8px] howBulletFont">
              <div>1.</div>
              <div>
                {t.rich("step-4-1", {
                  a: (chunks: any) => (
                    <a href="https://apps.apple.com/tw/app/max-%E8%99%9B%E6%93%AC%E8%B2%A8%E5%B9%A3%E4%BA%A4%E6%98%93%E6%89%80/id1370837255" target="_blank" className="linkDark">
                      {chunks}
                    </a>
                  ),
                })}
              </div>
              <div>2.</div>
              <div>{t("step-4-2")}</div>
              <div>3.</div>
              <div>{t("step-4-3")}</div>
            </div>
          )}
          {/*--- non-USD ---*/}
          {merchantCurrency != "USD" && (
            <div className="relative howBulletFont">
              {t.rich("step-4-notUSD", {
                span1: (chunks: any) => <span className="group">{chunks}</span>,
                span2: (chunks: any) => <span className="linkDark">{chunks}</span>,
                span3: (chunks: any) => <span className="whitespace-nowrap">{chunks}</span>,
                div: (chunks: any) => <div className="w-full bottom-[calc(100%+4px)] left-0 tooltip whitespace-normal">{chunks}</div>,
                tooltip: tcommon("reduceFxLossTooltip", { merchantCurrency: merchantCurrency }),
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
