import { currency2rateDecimal, currency2bank, currency2cex } from "@/utils/constants";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const Benefits = ({ merchantCurrency }: { merchantCurrency: string | undefined }) => {
  const [rates, setRates] = useState({ usdcToLocal: 0, usdToLocal: 0 });
  const t = useTranslations("HomePage.Why");

  // this useEffect will be called twice as merchantCurrency will go from undefined to defined
  useEffect(() => {
    getRates();
  }, [merchantCurrency]);

  const getRates = async () => {
    if (merchantCurrency == "USD") {
      setRates({ usdcToLocal: 1, usdToLocal: 1 });
    } else {
      const ratesRes = await fetch("/api/getRates", {
        method: "POST",
        body: JSON.stringify({ merchantCurrency: merchantCurrency }),
        headers: { "content-type": "application/json" },
      });
      const ratesData = await ratesRes.json();
      if (ratesData.status == "success") {
        setRates({ usdcToLocal: Number(ratesData.usdcToLocal), usdToLocal: Number(ratesData.usdToLocal) });
      }
    }
  };

  return (
    <div className="pt-[80px] pb-[96px] homeSectionSize flex flex-col items-center">
      {/*--- HEADER ---*/}
      <div className="w-full homeHeaderFont">{t("header")}</div>
      {/*--- CONTENT ---*/}
      <div
        className={`${
          merchantCurrency == "USD" ? "lg:h-[250px]" : "lg:h-[350px]"
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
            <div className="whyCardBody space-y-4">
              <div>
                {t.rich("card-2-body", {
                  span: (chunks: any) => <span className={`${merchantCurrency == "EUR" ? "" : "hidden"}`}>{chunks}</span>,
                  merchantCurrency: merchantCurrency,
                })}
              </div>
              <div className="text-[16px] leading-snug xl:desktop:text-[14px]">
                <div className="w-full flex justify-between">
                  <div>
                    USDC➜{merchantCurrency} ({currency2cex[merchantCurrency]}):
                  </div>
                  <div>{rates.usdcToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
                </div>
                <div className="w-full flex justify-between">
                  <div>
                    USD➜{merchantCurrency} ({currency2bank[merchantCurrency]}):
                  </div>
                  <div>{rates.usdToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
                </div>
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
};

export default Benefits;
