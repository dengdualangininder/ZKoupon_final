import { currencyToData } from "@/utils/constants";
import { useTranslations } from "next-intl";

const LowCost = ({ merchantCurrency }: { merchantCurrency: string }) => {
  const t = useTranslations("HomePage.LowCost");

  return (
    <div className="homeSectionSize flex flex-col items-center xl:flex-row xl:items-start xl:justify-between">
      {/*--- text (left) ---*/}
      <div className="w-full xl:w-[50%]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          {t("header-1")}
          <br />
          {t("header-2")}
        </div>
        {/*--- body ---*/}
        <div className="mt-8 w-full xl:desktop:w-[500px] homeBodyFont">{t("body")}</div>
      </div>
      {/*--- cards (right) ---*/}
      <div className="mt-8 xl:mt-0 w-full xl:w-[50%] space-y-7 flex flex-col items-center">
        {/*--- card 1 ---*/}
        <div className="lowCostCard">
          <div className="homeHeader2Font">{t("card-1-header")}</div>
          <div className="lowCostCardBody">{t("card-1-body")}</div>
        </div>

        {/*--- card 2 ---*/}
        <div className="lowCostCard">
          <div className="homeHeader2Font">{t("card-2-header", { withdrawalFee: currencyToData[merchantCurrency].offrampFee })}</div>
          <div className="lowCostCardBody">
            <div>{t("card-2-body-1")}:</div>
            {/*--- transfer fees ---*/}
            <div className="">
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
            <div className="homeHeader2Font">
              {t("card-3-header-1")}
              <br />
              {t("card-3-header-2", { conversionFee: currencyToData[merchantCurrency].conversionFee })}
            </div>
            <div className="lowCostCardBody">
              <p>{t("card-3-body-1", { merchantCurrency: merchantCurrency })}</p>
              <p>{t("card-3-body-2", { cex: currencyToData[merchantCurrency].cex, conversionFee: currencyToData[merchantCurrency].conversionFee })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowCost;
