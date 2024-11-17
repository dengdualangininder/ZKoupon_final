import { useTranslations } from "next-intl";
import { currency2decimal } from "@/utils/constants";
import { PaymentSettings, Transaction } from "@/db/UserModel";

export default function Notification({
  notification,
  setNotification,
  transactions,
  paymentSettings,
}: {
  notification: boolean;
  setNotification: any;
  transactions: Transaction[];
  paymentSettings: PaymentSettings;
}) {
  const t = useTranslations("App.Page");

  return (
    <div
      className={`${
        notification ? "top-4" : "-top-[92px] portrait:sm:-top-[128px] landscape:lg:-top-[128px]"
      } w-full landscape:w-[calc(100%-120px)] landscape:lg:w-[calc(100%-160px)] h-[88px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[84px] flex justify-center fixed right-0 z-[90] transition-[top] duration-500`}
    >
      <div className="pl-[4%] bannerWidth flex items-center justify-between rounded-xl bg-lightButton dark:bg-darkButton">
        {/*---content---*/}
        <div className=" flex-col justify-center">
          <div className="pb-1 text-base portrait:sm:text-lg landscape:lg:text-lg font-medium text-white">{t("bannerModal.new")}</div>
          <div className="font-semibold text-[22px] portrait:sm:text-3xl landscape:lg:text-3xl landscape:xl:desktop:text-2xl">
            {transactions?.slice(-1)[0].currencyAmount.toFixed(currency2decimal[paymentSettings?.merchantCurrency!])} {paymentSettings?.merchantCurrency} {t("bannerModal.from")} ..
            {transactions?.slice(-1)[0].customerAddress.slice(-4)}
          </div>
        </div>
        {/*--- buttons ---*/}
        <button onClick={() => setNotification(false)} className="xButtonBanner">
          &#10005;
        </button>
      </div>
    </div>
  );
}
