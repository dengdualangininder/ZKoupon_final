import { currencyToData } from "@/utils/constants";
import { useTranslations } from "next-intl";

export default function LowCost({ merchantCurrency }: { merchantCurrency: string }) {
  const t = useTranslations("HomePage.LowCost");

  return (
    <div className="py-20 homeSectionSizeNew flex flex-col items-center lg:flex-row lg:items-start">
      {/*--- LEFT ---*/}
      <div className="w-full lg:w-[50%] lg:pr-[16px]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          {t("header-1")}
          <br />
          {t("header-2")}
        </div>
        {/*--- body ---*/}
        <div className="mt-[24px] w-full text-lg">{t("body")}</div>
      </div>
      {/*--- RIGHT ---*/}
      <div className="w-full lg:w-[50%] mt-[32px] lg:mt-0 flex flex-col items-center space-y-[24px]">
        {/*--- card 1 ---*/}
        <div className="lowCostCard">
          <div className="lowCostCardHeader">{t.rich("card-1-header", { span: (chunks) => <span className="text-blue-600">{chunks}</span> })}</div>
          <div className="lowCostCardBody">{t("card-1-body")}</div>
        </div>

        {/*--- card 2 ---*/}
        <div className="lowCostCard">
          <div className="lowCostCardHeader">
            {t.rich("card-2-header", { withdrawalFee: currencyToData[merchantCurrency].offrampFee, span: (chunks) => <span className="text-blue-600">{chunks}</span> })}
          </div>
          <div className="lowCostCardBody">
            <div>{t("card-2-body-1")}:</div>
            {/*--- transfer fees ---*/}
            <div className="text-sm">
              <div className="w-full flex justify-between items-center">
                <div>{t("card-2-body-2", { cex: currencyToData[merchantCurrency].cex })}</div>
                <div>~0.05 USDC</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div>{t("card-2-body-3", { cex: currencyToData[merchantCurrency].cex })}</div>
                <div>{currencyToData[merchantCurrency].offrampFee}</div>
              </div>
            </div>
          </div>
        </div>

        {/*--- card 3 ---*/}
        {merchantCurrency != "USD" && (
          <div className="lowCostCard">
            <div className="lowCostCardHeader">
              {t.rich("card-3-header-1", { merchantCurrency: merchantCurrency, span: (chunks) => <span className="text-blue-600">{chunks}</span> })}
              <br />
              {t.rich("card-3-header-2", { conversionFee: currencyToData[merchantCurrency].conversionFee, span: (chunks) => <span className="text-blue-600">{chunks}</span> })}
            </div>
            <div className="lowCostCardBody">
              <p>{t("card-3-body-1", { merchantCurrency: merchantCurrency, cex: currencyToData[merchantCurrency].cex })}</p>
              <p>{t("card-3-body-2", { cex: currencyToData[merchantCurrency].cex, conversionFee: currencyToData[merchantCurrency].conversionFee })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
