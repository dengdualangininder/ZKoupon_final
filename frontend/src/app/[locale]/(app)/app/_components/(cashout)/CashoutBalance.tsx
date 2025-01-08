import Image from "next/image";
// images
import { IoInformationCircleOutline } from "react-icons/io5";
// i18n
import { useTranslations } from "next-intl";
// images
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";
// utils
import { currency2symbol, currency2decimal } from "@/utils/constants";
// types
import { PaymentSettings } from "@/db/UserModel";
import { Rates } from "@/utils/types";

export default function CashoutBalance({
  paymentSettings,
  rates,
  balance,
  details,
  setDetails,
}: {
  paymentSettings: PaymentSettings;
  rates: Rates | undefined;
  balance: string | undefined;
  details: boolean;
  setDetails: any;
}) {
  const t = useTranslations("App.CashOut");

  return (
    <div className="cashoutBalanceContainer">
      {/*--- balance ---*/}
      {balance && rates ? (
        <div className={`cashoutBalance`}>
          <div>
            {currency2symbol[paymentSettings?.merchantCurrency!]}&nbsp;
            <span>{(Number(balance) * rates.usdcToLocal).toFixed(currency2decimal[paymentSettings?.merchantCurrency!])}</span>
          </div>
          {/*--- arrow ---*/}
          <div className="cashoutArrowContainer group" onClick={() => setDetails(!details)}>
            {details ? <FaAngleUp className="cashoutArrow group-hover:desktop:brightness-[1.2]" /> : <FaAngleDown className="cashoutArrow group-hover:desktop:brightness-[1.2]" />}
          </div>
        </div>
      ) : (
        <div className="cashoutBalance py-[6px] w-[150px] skeleton">0000</div>
      )}
      {/*---details---*/}
      <div className={`${details ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} grid transition-all duration-500`}>
        <div className="overflow-hidden flex">
          <div className="cashoutDetailsContainer">
            {/*--- usdc label ---*/}
            <div className="flex items-center">
              <div className="relative w-[20px] h-[20px] portrait:sm:w-[24px] landscape:lg:w-[24px] portrait:sm:h-[24px] landscape:lg:h-[24px] desktop:!w-[18px] desktop:!h-[18px] mr-[4px]">
                <Image src="/usdc.svg" alt="USDC" fill />
              </div>
              USDC
            </div>
            {/*--- usdc balance ---*/}
            <div className="justify-self-end py-[4px]">{balance}</div>
            {/*--- rate label ---*/}
            <div className="flex items-center gap-[4px]">
              <p>{t("rate")}</p>
              <IoInformationCircleOutline className="text-[20px] desktop:text-[16px] peer text-blue-500 dark:text-darkButton translate-y-[1px] desktop:hover:brightness-[1.2]" />
              <p className="w-full top-0 left-0 cashoutTooltip">{t("rateTooltip", { merchantCurrency: paymentSettings.merchantCurrency })}</p>
            </div>
            {/*--- rate value ---*/}
            <div className="justify-self-end py-[4px]">{rates?.usdcToLocal}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
