import { useState } from "react";
import Image from "next/image";

const CashoutIntroModal = ({ setCashoutIntroModal }: { setCashoutIntroModal: any }) => {
  const [step, setStep] = useState("one");
  return (
    <div className="">
      <div className="w-[330px] portrait:sm:w-[420px] landscape:lg:w-[420px] min-h-[600px] flex flex-col items-center rounded-xl bg-white fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[90]">
        {/*---close---*/}
        <div className="w-full h-[60px] relative">
          <div onClick={() => setCashoutIntroModal(false)} className="absolute top-2 right-3 text-3xl p-2">
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
                <div className="font-bold text-center text-xl portrait:sm:text-2xl landscape:lg:text-2xl">How To Cash Out</div>
                {/*---image---*/}
                <div className="w-full h-[250px] relative bg-gray-300">
                  <Image src="/logo.svg" alt="transfer" fill />
                </div>
                {/*---text---*/}
                <div className="textLg">
                  <span className="font-semibold">Step 1:</span> Under <span className="font-semibold">Flash Account</span>, click <span className="font-semibold">TRANSFER</span>{" "}
                  to move USDC from your Flash account to your Coinbase account.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-end">
                <button
                  className="w-[100px] h-[52px] portrait:sm:w-[140px] portrait:sm:h-[72px] landscape:lg:w-[140px] landscape:lg:h-[72px] landscape:desktop:xl:w-[100px] landscape:desktop:xl:h-[52px] text-lg portrait:sm:text-3xl landscape:lg:text-3xl landscape:desktop:xl:text-xl font-medium text-white bg-blue-500 border-2 border-blue-500 active:opacity-50 lg:hover:opacity-50 rounded-[4px]"
                  onClick={() => setStep("two")}
                >
                  NEXT &nbsp;&#10095;
                </button>
              </div>
            </div>
          )}
          {step == "two" && (
            <div className="flex flex-col">
              <div className="flex-1 space-y-4">
                {/*---title---*/}
                <div className="font-bold text-center text-xl portrait:sm:text-2xl landscape:lg:text-2xl">How To Cash Out</div>
                {/*---image---*/}
                <div className="w-full h-[250px] relative bg-gray-300">
                  <Image src="/logo.svg" alt="transfer" fill />
                </div>
                {/*---text---*/}
                <div className="textLg">
                  <span className="font-semibold">Step 2:</span> Under <span className="font-semibold">Coinbase Account</span>, click{" "}
                  <span className="font-semibold">CASH OUT</span> to transfer funds from your Coinbase account to your bank.
                </div>
              </div>
              {/*--- buttons ---*/}
              <div className="w-full portrait:h-[80px] landscape:h-[70px] portrait:sm:h-[100px] landscape:lg:h-[100px] flex justify-start">
                <button
                  className="w-[100px] h-[52px] portrait:sm:w-[140px] portrait:sm:h-[72px] landscape:lg:w-[140px] landscape:lg:h-[72px] landscape:desktop:xl:w-[100px] landscape:desktop:xl:h-[52px] text-lg portrait:sm:text-3xl landscape:lg:text-3xl landscape:desktop:xl:text-xl font-medium text-gray-700 bg-white border-2 border-gray-700 active:opacity-50 lg:hover:opacity-50 rounded-[4px]"
                  onClick={() => setStep("one")}
                >
                  &#10094;&nbsp; BACK
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
