import { currency2rateDecimal, currency2bank, currency2cex } from "@/utils/constants";
import { AllRates } from "@/utils/types";
import { useTranslations } from "next-intl";

export default function Benefits({ merchantCurrency, allRates }: { merchantCurrency: string | undefined; allRates: AllRates }) {
  const t = useTranslations("HomePage.Why");

  return (
    <div className="pt-[80px] pb-[96px] homeSectionSize min-h-[650px] flex flex-col items-center">
      {/*--- HEADER ---*/}
      <div className="w-full homeHeaderFont">{t("header")}</div>
      {/*--- CONTENT ---*/}
      <div
        className={`${
          merchantCurrency == "USD" ? "lg:h-[250px]" : "lg:h-[320px]"
        } mt-[40px] portrait:sm:mt-[60px] landscape:lg:mt-[60px] w-full flex flex-col items-center lg:flex-row lg:justify-between lg:space-x-[12px] space-y-6 lg:space-y-0`}
      >
        {/*--- card1 ---*/}
        <div className="whyCard">
          <div className="lowCostCardHeader">{t.rich("card-1-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
          <div className="whyCardBody">{t("card-1-body")}</div>
        </div>
        {/*--- card2 ---*/}
        {merchantCurrency && merchantCurrency != "USD" && (
          <div className="whyCard">
            <div className="lowCostCardHeader">{t.rich("card-2-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
            <div className="whyCardBody space-y-[16px]">
              <div>
                {t.rich("card-2-body", {
                  span: (chunks: any) => <span className={`${merchantCurrency == "EUR" ? "" : "hidden"}`}>{chunks}</span>,
                  merchantCurrency: merchantCurrency,
                })}
              </div>
              <div className="text-[16px] leading-snug desktop:text-[14px] grid grid-cols-[1fr,auto]">
                <div>
                  USDC➜{merchantCurrency} ({currency2cex[merchantCurrency]}):
                </div>
                <div>{allRates[merchantCurrency].usdcToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
                <div>
                  USD➜{merchantCurrency} ({currency2bank[merchantCurrency]}):
                </div>
                <div>{allRates[merchantCurrency].usdToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
              </div>
            </div>
          </div>
        )}
        {/*--- card2 (USD only) ---*/}
        {merchantCurrency == "USD" && (
          <div className="whyCard">
            <div className="lowCostCardHeader">{t.rich("card-2-usd-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
            <div className="whyCardBody">{t("card-2-usd-body")}</div>
          </div>
        )}
        {/*--- card3 ---*/}
        <div className="whyCard">
          <div className="lowCostCardHeader">{t.rich("card-3-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
          <div className="whyCardBody">{t("card-3-body")}</div>
        </div>
      </div>
    </div>
  );
}
