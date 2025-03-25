import { useTranslations } from "next-intl";
import { currency2decimal } from "@/utils/constants";
import { PaymentSettings, Transaction } from "@/db/UserModel";

export default function Notification({ newTxn, setNewTxn, paymentSettings }: { newTxn: Transaction | null; setNewTxn: any; paymentSettings: PaymentSettings }) {
  const t = useTranslations("App.Page");

  return (
    <div
      className={`${
        newTxn ? "top-[12px]" : "-top-[92px] portrait:sm:-top-[128px] landscape:lg:-top-[128px]"
      } landscape:pl-[120px] landscape:lg:pl-[160px] landscape:desktop:!pl-[200px] w-full flex justify-center h-[80px] portrait:sm:h-[100px] landscape:lg:h-[100px] desktop:!h-[84px] fixed z-90 transition-[top] duration-500 overflow-y-auto`}
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="w-[90%] portrait:sm:w-[540px] landscape:lg:w-[600px] desktop:w-[440px]! px-[12px] portrait:sm:px-[24px] landscape:lg:px-[24px] desktop:px-[16px]! flex items-center justify-between rounded-[12px] bg-slate-300 dark:bg-darkButton">
        {/*---content---*/}
        <div className="flex flex-col gap-[4px] portrait:sm:gap-[8px] landscape:lg:gap-[8px]">
          <div className="textSmApp font-medium text-black dark:text-white">{t("bannerModal.new")}</div>
          <div className="notificationText">
            {newTxn?.currencyAmount.toFixed(currency2decimal[paymentSettings?.merchantCurrency!])} {paymentSettings?.merchantCurrency} {t("bannerModal.from")} ..
            {newTxn?.customerAddress.slice(-4)}
          </div>
        </div>
        {/*--- x button ---*/}
        <button
          onClick={() => setNewTxn(null)}
          className="text-[32px] portrait:sm:text-[40px] landscape:lg:text-[40px] desktop:text-[30px]! cursor-pointer desktop:hover:text-slate-500 dark:desktop:hover:text-slate-300"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
