// nextjs
import { useState } from "react";
// context
import { useUserInfo } from "../../../_contexts/Web3AuthProvider";

// other
import { useTranslations } from "next-intl";
// components
import TradeMAXModal from "./exchanges/TradeMAXModal";
// constants
import { currency2symbol } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";

const CashoutIntroModal = ({
  paymentSettingsState,
  cashoutSettingsState,
  setCashoutIntroModal,
  setTradeMAXModal,
}: {
  paymentSettingsState: PaymentSettings;
  cashoutSettingsState: CashoutSettings;
  setCashoutIntroModal: any;
  setTradeMAXModal: any;
}) => {
  const userInfo = useUserInfo();

  const [step, setStep] = useState("one");

  const t = useTranslations("App.CashoutIntroModal");
  const tcommon = useTranslations("Common");

  return (
    <div className="">
      <div className="cashoutIntroModal">
        <div className="w-full h-full modalXpadding overflow-y-auto flex flex-col">
          {/*---title---*/}
          <div className="text2xl py-[16px] desktop:py-[12px] font-semibold text-center">{t("title")}</div>
          {/*---step one & step two ---*/}
          <div className="w-full flex-1">
            {step == "one" && (
              <div className="h-full flex flex-col">
                {/*--- image + text ---*/}
                <div className="flex-1 flex flex-col items-center">
                  {/*--- image container ---*/}
                  <div className="w-full h-[210px] portrait:sm:h-[260px] landscape:lg:h-[260px] landscape:xl:desktop:h-[220px] relative">
                    {/*--- image ---*/}
                    <div className="cashoutContainer absolute scale-[0.86] portrait:sm:scale-[0.8] landscape:lg:scale-[0.8] dark:shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                      <div className="cashoutHeader h-[36px] flex items-center">Flash {tcommon("account")}</div>
                      <div className="cashoutBalanceContainer">
                        <div className="cashoutBalance">
                          <div>
                            {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                            <span>123.45</span>
                          </div>
                          <div className="cashoutArrowContainer">
                            <FontAwesomeIcon icon={faAngleDown} className="cashoutArrow" />
                          </div>
                        </div>
                      </div>
                      <div className="cashoutButtonContainer relative">
                        <div className="absolute w-[calc(180px+24px)] portrait:sm:w-[calc(224px+24px)] landscape:lg:w-[calc(224px+24px)] landscape:xl:desktop:w-[calc(200px+24px)] h-[calc(100%+28px)] border-4 border-red-500 z-[2] bottom-[-14px] right-[-16px]"></div>
                        <button className="cashoutButton">{cashoutSettingsState.cex ? tcommon("transferToCEX", { cex: cashoutSettingsState.cex }) : tcommon("transfer")}</button>
                      </div>
                    </div>
                  </div>
                  {/*---text---*/}
                  <div className="pt-[32px] desktop:pt-[16px] textLg2">
                    <div>
                      <span className="font-semibold dark:font-bold">{t("step-1-1")} :</span>
                    </div>
                    <div className="mt-2">
                      {t.rich("step-1-2", {
                        span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                        span2: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                        cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : "cryptocurrency exchange",
                        transferToCEX: cashoutSettingsState.cex ? tcommon("transferToCEX", { cex: cashoutSettingsState.cex }) : tcommon("transfer"),
                      })}
                    </div>
                  </div>
                </div>
                {/*--- buttons ---*/}
                <div className="cashoutIntroButtonContainer justify-end">
                  <button className="cashoutIntroNext" onClick={() => setStep("two")}>
                    {tcommon("next")} &nbsp;&#10095;
                  </button>
                </div>
              </div>
            )}
            {step == "two" && cashoutSettingsState.cex == "Coinbase" && paymentSettingsState.merchantCountry != "Other" && (
              <div className="h-full flex flex-col">
                {/*--- image + text ---*/}
                <div className="flex-1 flex flex-col items-center">
                  {/*--- image container ---*/}
                  <div className="w-full h-[210px] portrait:sm:h-[260px] landscape:lg:h-[260px] landscape:xl:desktop:h-[220px] relative">
                    {/*--- image ---*/}
                    <div className="cashoutContainer absolute scale-[0.86] portrait:sm:scale-[0.8] landscape:lg:scale-[0.8] dark:shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                      <div className="cashoutHeader h-[36px] flex items-center">Coinbase {tcommon("account")}</div>
                      <div className="cashoutBalanceContainer">
                        <div className="cashoutBalance">
                          <div>
                            {currency2symbol[paymentSettingsState?.merchantCurrency!]}&nbsp;
                            <span>123.45</span>
                          </div>
                          <div className="cashoutArrowContainer">
                            <FontAwesomeIcon icon={faAngleDown} className="cashoutArrow" />
                          </div>
                        </div>
                      </div>
                      <div className="cashoutButtonContainer relative">
                        <div className="absolute w-[calc(180px+24px)] portrait:sm:w-[calc(224px+24px)] landscape:lg:w-[calc(224px+24px)] landscape:xl:desktop:w-[calc(200px+24px)] h-[calc(100%+28px)] border-4 border-red-500 z-[2] bottom-[-14px] right-[-16px]"></div>
                        <button className="cashoutButton">{tcommon("transferToBank")}</button>
                      </div>
                    </div>
                  </div>
                  {/*---text---*/}
                  <div className="pt-[32px] desktop:pt-[16px] textLg2">
                    <div>
                      <span className="font-semibold dark:font-bold">{t("step-2-1")} :</span>
                    </div>
                    <div className="mt-2">
                      {t.rich("step-2-2cb", {
                        span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                        span2: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
                        transferToBank: tcommon("transferToBank"),
                      })}
                    </div>
                  </div>
                </div>
                {/*--- buttons ---*/}
                <div className="cashoutIntroButtonContainer">
                  <button className="cashoutIntroBack" onClick={() => setStep("one")}>
                    &#10094;&nbsp; {tcommon("back")}
                  </button>
                  <button className="cashoutIntroNext" onClick={() => setCashoutIntroModal(false)}>
                    {tcommon("done")}
                  </button>
                </div>
              </div>
            )}
            {step == "two" && (cashoutSettingsState.cex != "Coinbase" || paymentSettingsState.merchantCountry == "Other") && (
              <div className="w-full h-full flex flex-col">
                {/*--- content ---*/}
                <div className="textLg2 flex-1 mt-[60px] flex flex-col items-center">
                  <div className="w-full font-semibold dark:font-bold">{t("step-2-1")} :</div>
                  <div className="mt-2">
                    {t("step-2-2", {
                      cex: cashoutSettingsState.cex ? tcommon(cashoutSettingsState.cex) : "cryptocurrency exchange",
                      merchantCurrency: paymentSettingsState.merchantCurrency,
                    })}
                  </div>
                  {cashoutSettingsState.cex == "MAX" && (
                    <div className="w-full mt-4 link" onClick={() => setTradeMAXModal(true)}>
                      {t("step-2-max")}
                    </div>
                  )}
                </div>
                {/*--- buttons ---*/}
                <div className="w-full cashoutIntroButtonContainer">
                  <button className="cashoutIntroBack" onClick={() => setStep("one")}>
                    &#10094;&nbsp; {tcommon("back")}
                  </button>
                  <button className="cashoutIntroNext" onClick={() => setCashoutIntroModal(false)}>
                    {tcommon("done")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default CashoutIntroModal;
