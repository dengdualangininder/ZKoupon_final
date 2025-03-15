import { currency2rateDecimal, currency2bank, currency2cex } from "@/utils/constants";
import { AllRates } from "@/utils/types";
import { useTranslations } from "next-intl";

export default function Benefits({ merchantCurrency, allRates }: { merchantCurrency: string | undefined; allRates: AllRates }) {
  const t = useTranslations("HomePage.Why");

  return (
    <div className="pt-[80px] pb-[96px] homeSectionSize flex flex-col items-center">
      {/*--- HEADER ---*/}
      <div className="w-full textHeaderHome max-w-[770px] xl:max-w-none">{t("header")}</div>
      {/*--- CARD CONTAINER ---*/}
      <div className="mt-[40px] lg:mt-[60px] max-w-[550px] xl:max-w-none xl:min-h-[250px] grid grid-cols-1 xl:grid-cols-3 gap-[24px]">
        {/*--- card1 ---*/}
        <div className="whyCard">
          <div className="whiteCardHeader">{t.rich("card-1-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
          <div className="whiteCardBody">{t("card-1-body")}</div>
        </div>
        {/*--- card2 ---*/}
        {merchantCurrency && merchantCurrency != "USD" && (
          <div className="whyCard">
            <div className="whiteCardHeader">{t.rich("card-2-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
            <div className="whiteCardBody space-y-[16px]">
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
            <div className="whiteCardHeader">{t.rich("card-2-usd-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
            <div className="whiteCardBody">{t("card-2-usd-body")}</div>
          </div>
        )}
        {/*--- card3 ---*/}
        <div className="whyCard">
          <div className="whiteCardHeader">{t.rich("card-3-header", { span: (chunks) => <span className="text-blue-700">{chunks}</span> })}</div>
          <div className="whiteCardBody">{t("card-3-body")}</div>
        </div>
      </div>
    </div>
  );
}
