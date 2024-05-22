import { useState } from "react";
import Image from "next/image";

const CashoutIntroModal = ({ setCashoutIntroModal }: { setCashoutIntroModal: any }) => {
  const [step, setStep] = useState("one");
  return (
    <div className="">
      <div className="w-[330px] portrait:sm:w-[420px] landscape:lg:w-[420px] min-h-[640px] flex flex-col items-center rounded-xl bg-white fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[90]">
        {/*---close---*/}
        <div className="w-full h-[50px] relative">
          <div onClick={() => setCashoutIntroModal(false)} className="absolute top-2 right-3 p-2 xButton">
            &#10005;
          </div>
        </div>
        {/*---step one & step two ---*/}
        <div className="flex-1 flex px-6 portrait:sm:px-10 landscape:lg:px-10 overflow-y-auto">
          {step == "one" && (
            <div className="flex flex-col">
              {/*--- title + image + text ---*/}
              <div className="flex-1 space-y-4">
                {/*---title---*/}
                <div className="font-semibold text-center textXl underline underline-offset-4">How To Cash Out</div>
                {/*---image---*/}
                <div className="w-auto h-[320px] relative">
                  <Image src="/cashoutIntro-1.png" alt="transfer" fill style={{ objectFit: "contain" }} />
                </div>
                {/*---text---*/}
                <div className="textLg">
                  <span className="font-semibold">Step 1:</span> Under <span className="font-semibold">Flash Account</span>, click{" "}
                  <span className="font-semibold">Transfer to Coinbase</span> to move USDC from Flash to your Coinbase account.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-end">
                <button className="next" onClick={() => setStep("two")}>
                  NEXT &nbsp;&#10095;
                </button>
              </div>
            </div>
          )}
          {step == "two" && (
            <div className="flex flex-col">
              <div className="flex-1 space-y-4">
                {/*---title---*/}
                <div className="font-semibold text-center textXl underline underline-offset-4">How To Cash Out</div>
                {/*---image---*/}
                <div className="w-full h-[320px] relative">
                  <Image src="/cashoutIntro-2.png" alt="transfer" fill style={{ objectFit: "contain" }} />
                </div>
                {/*---text---*/}
                <div className="textLg">
                  <span className="font-semibold">Step 2:</span> Under <span className="font-semibold">Coinbase Account</span>, click{" "}
                  <span className="font-semibold">Transfer to Bank</span> to transfer funds from your Coinbase account to your bank.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-between">
                <button className="back" onClick={() => setStep("one")}>
                  &#10094;&nbsp; BACK
                </button>
                <button className="next" onClick={() => setCashoutIntroModal(false)}>
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
