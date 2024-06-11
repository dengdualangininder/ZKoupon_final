// nextjs
import { useState } from "react";
import Image from "next/image";
// constants
import { currency2decimal, currency2rateDecimal, currency2symbol } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faArrowDown, faEllipsisVertical, faInfinity, faAngleDown, faAngleUp, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const CashoutIntroModal = ({
  paymentSettingsState,
  cashoutSettingsState,
  setCashoutIntroModal,
}: {
  paymentSettingsState: PaymentSettings | null;
  cashoutSettingsState: CashoutSettings | null;
  setCashoutIntroModal: any;
}) => {
  const [step, setStep] = useState("one");
  return (
    <div className="">
      <div className="modalColor w-[350px] portrait:sm:w-[410px] landscape:lg:w-[410px] h-[560px] portrait:sm:h-[640px] landscape:lg:h-[640px] landscape:xl:desktop:h-[560px] flex flex-col items-center rounded-2xl fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[90]">
        {/*---close---*/}
        <div className="hidden w-full h-[50px] relative">
          <div onClick={() => setCashoutIntroModal(false)} className="absolute top-2 right-3 p-2 xButton">
            &#10005;
          </div>
        </div>
        {/*---title---*/}
        <div className="pt-8 pb-4 font-semibold text-center textXl">How To Cash Out</div>
        {/*---step one & step two ---*/}
        <div className="flex-1">
          {step == "one" && (
            <div className="h-full flex flex-col">
              {/*--- image + text ---*/}
              <div className="flex-1 flex flex-col items-center">
                {/*--- image container ---*/}
                <div className="w-full h-[210px] portrait:sm:h-[260px] landscape:lg:h-[260px] landscape:xl:desktop:h-[220px] relative">
                  {/*--- image ---*/}
                  <div className="cashoutContainer absolute scale-[0.86] portrait:sm:scale-[0.8] landscape:lg:scale-[0.8] shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                    <div className="cashoutHeader h-[36px] flex items-center">Flash Account</div>
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
                      <button className="cashoutButton">Transfer to {cashoutSettingsState?.cex ?? "CEX"}</button>
                    </div>
                  </div>
                </div>
                {/*---text---*/}
                <div className="pt-4 px-6 portrait:sm:px-10 landscape:lg:px-10 textLg">
                  <span className="font-semibold dark:bold">Step 1 of 2:</span> Under <span className="font-semibold dark:bold">Flash Account</span>, click{" "}
                  <span className="font-semibold dark:bold">Transfer to Coinbase</span> to move USDC from Flash to your Coinbase account.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="px-6 portrait:sm:px-10 landscape:lg:px-10 w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-end">
                <button className="cashoutIntroNext" onClick={() => setStep("two")}>
                  NEXT &nbsp;&#10095;
                </button>
              </div>
            </div>
          )}
          {step == "two" && (
            <div className="h-full flex flex-col">
              {/*--- image + text ---*/}
              <div className="flex-1 flex flex-col items-center">
                {/*--- image container ---*/}
                <div className="w-full h-[210px] portrait:sm:h-[260px] landscape:lg:h-[260px] landscape:xl:desktop:h-[220px] relative">
                  {/*--- image ---*/}
                  <div className="cashoutContainer absolute scale-[0.86] portrait:sm:scale-[0.8] landscape:lg:scale-[0.8] shadow-[1px_1px_10px_0px_rgb(255,255,255,0.3)]">
                    <div className="cashoutHeader h-[36px] flex items-center">Flash Account</div>
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
                      <button className="cashoutButton">Transfer to {cashoutSettingsState?.cex ?? "CEX"}</button>
                    </div>
                  </div>
                </div>
                {/*---text---*/}
                <div className="pt-4 px-6 portrait:sm:px-10 landscape:lg:px-10 textLg">
                  <span className="font-semibold">Step 2:</span> Under <span className="font-semibold">Coinbase Account</span>, click{" "}
                  <span className="font-semibold">Transfer to Bank</span> to transfer funds from your Coinbase account to your bank.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="px-6 portrait:sm:px-10 landscape:lg:px-10 w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
                <button className="cashoutIntroBack" onClick={() => setStep("one")}>
                  &#10094;&nbsp; BACK
                </button>
                <button className="cashoutIntroNext" onClick={() => setCashoutIntroModal(false)}>
                  DONE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setCashoutIntroModal(false)}></div>
    </div>
  );
};

export default CashoutIntroModal;
