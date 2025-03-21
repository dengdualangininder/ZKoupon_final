// nextjs
import { useState } from "react";
// other
import { useTranslations } from "next-intl";
// constants
import { currency2symbol } from "@/utils/constants";
// images
import { FaAngleDown } from "react-icons/fa6";
// types
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";

export default function CashoutIntroModal({
  paymentSettings,
  cashoutSettings,
  setCashoutIntroModal,
  setTradeMAXModal,
}: {
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  setCashoutIntroModal: any;
  setTradeMAXModal: any;
}) {
  // hooks
  const t = useTranslations("App.CashoutIntroModal");
  const tcommon = useTranslations("Common");

  // states
  const [step, setStep] = useState("one");

  return (
    <div className="">
      <div className="cashoutIntroModal">
        <div className="h-full modalXpadding overflow-y-auto flex flex-col items-center">
          {/*---title---*/}
          <div className="modalHeaderFont space-y-[4px]">
            <p>{t("title")}</p>
            <p>({step === "one" ? t("step-1-1") : t("step-2-1")})</p>
          </div>
          {step == "one" && (
            <>
              {/*---text---*/}
              <p className="pt-[40px] pb-[20px]">
                {t.rich("step-1-2", {
                  span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                  cex: cashoutSettings.cex ? tcommon(cashoutSettings.cex) : "cryptocurrency exchange",
                  transferToCEX: cashoutSettings.cex ? tcommon("transferToCEX", { cex: cashoutSettings.cex }) : tcommon("transfer"),
                })}
              </p>
              {/*--- image ---*/}
              <div className="cashoutCard w-full scale-[0.8] dark:shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                <div className="cashoutHeader h-[36px] flex items-center">Nulla {tcommon("account")}</div>
                <div className="cashoutBalanceContainer">
                  <div className="cashoutBalance">
                    <div>
                      {currency2symbol[paymentSettings?.merchantCurrency!]}&nbsp;
                      <span>123.45</span>
                    </div>
                    <div className="cashoutArrowContainer">
                      <FaAngleDown className="cashoutArrow" />
                    </div>
                  </div>
                </div>
                <div className="cashoutButtonContainer">
                  <div className="cashoutButton flex items-center justify-center relative">
                    {cashoutSettings.cex ? tcommon("transferToCEX", { cex: cashoutSettings.cex }) : tcommon("transfer")}
                    <div className="absolute w-[calc(100%+16px)] h-[calc(100%+16px)] border-4 border-red-500"></div>
                  </div>
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="flex-1 cashoutIntroButtonContainer justify-end">
                <button className="cashoutIntroNext" onClick={() => setStep("two")}>
                  {tcommon("next")} &nbsp;&#10095;
                </button>
              </div>
            </>
          )}
          {step == "two" && cashoutSettings.cex == "Coinbase" && paymentSettings.merchantCountry != "Other" && (
            <>
              {/*---text---*/}
              <p className="pt-[40px] pb-[20px]">
                {t.rich("step-2-2cb", {
                  span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                  span2: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                  transferToBank: tcommon("transferToBank"),
                })}
              </p>
              {/*--- image ---*/}
              <div className="cashoutCard w-full scale-[0.8] dark:shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                <div className="cashoutHeader h-[36px] flex items-center">Coinbase {tcommon("account")}</div>
                <div className="cashoutBalanceContainer">
                  <div className="cashoutBalance">
                    <div>
                      {currency2symbol[paymentSettings?.merchantCurrency!]}&nbsp;
                      <span>123.45</span>
                    </div>
                    <div className="cashoutArrowContainer">
                      <FaAngleDown className="cashoutArrow" />
                    </div>
                  </div>
                </div>
                <div className="cashoutButtonContainer">
                  <div className="cashoutButton flex items-center justify-center relative">
                    {tcommon("transferToBank")}
                    <div className="absolute w-[calc(100%+16px)] h-[calc(100%+16px)] border-4 border-red-500"></div>
                  </div>
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="flex-1 cashoutIntroButtonContainer">
                <button className="introBack" onClick={() => setStep("one")}>
                  &#10094;&nbsp; {tcommon("back")}
                </button>
                <button
                  className="cashoutIntroNext"
                  onClick={() => {
                    setCashoutIntroModal(false);
                    window.localStorage.removeItem("cashoutIntroModal");
                  }}
                >
                  {tcommon("done")}
                </button>
              </div>
            </>
          )}
          {step == "two" && (cashoutSettings.cex != "Coinbase" || paymentSettings.merchantCountry == "Other") && (
            <>
              {/*--- content ---*/}
              <p className="pt-[40px] pb-[20px]">
                {t("step-2-2", {
                  cex: cashoutSettings.cex ? tcommon(cashoutSettings.cex) : "cryptocurrency exchange",
                  merchantCurrency: paymentSettings.merchantCurrency,
                })}
              </p>
              {cashoutSettings.cex == "MAX" && (
                <div className="w-full link" onClick={() => setTradeMAXModal(true)}>
                  {t("step-2-max")}
                </div>
              )}
              {/*--- buttons ---*/}
              <div className="flex-1 cashoutIntroButtonContainer">
                <button className="introBack" onClick={() => setStep("one")}>
                  &#10094;&nbsp; {tcommon("back")}
                </button>
                <button
                  className="cashoutIntroNext"
                  onClick={() => {
                    setCashoutIntroModal(false);
                    window.localStorage.removeItem("cashoutIntroModal");
                  }}
                >
                  {tcommon("done")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
