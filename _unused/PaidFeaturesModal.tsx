"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const DepositAddressModal = ({ setDepositAddressModal }) => {
  return (
    <div className="">
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setDepositAddressModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to find your cryptocurrency exchange's token deposit addresses</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-y-auto overscroll-contain h-full">
          <div className="modalContentContainer">
            <div className="flex flex-col leading-tight space-y-2">
              {/*---features description---*/}
              <div className="w-full flex justify-center xs:justify-start">
                <div className="text-lg text-blue-500 hover:underline cursor-pointer" onClick={() => setExpandAuto(!expandAuto)}>
                  {expandAuto ? "Hide" : "See"} features and pricing <FontAwesomeIcon icon={expandAuto ? faAngleUp : faAngleDown} className="ml-0.5 align-middle" />
                </div>
              </div>
              <div className={`${expandAuto ? "max-h-[500px]" : "max-h-[0px]"} w-full xs:w-[420px] md:w-[356px] lg:w-[360px] flex overflow-hidden transition-all duration-[500ms]`}>
                <div className="text-lg xs:text-sm leading-tight text-slate-700 border border-gray-500 rounded-xl px-3 py-2">
                  <div className="mt-1 flex">
                    <div className="mr-2">&bull;</div>
                    <div>refund customers with 1-click (in Payments tab)</div>
                  </div>
                  <div className="mt-1 flex">
                    <div className="mr-2">&bull;</div>
                    <div>download spreadsheets of payment history (in Payments tab)</div>
                  </div>
                  <div className="mt-1 flex">
                    <div className="mr-2">&bull;</div>
                    <div>cash out (receive money in the bank) with 1-click (in Cash Out tab)</div>
                  </div>
                  <div className="mt-1 flex relative">
                    <div className="mr-2">&bull;</div>
                    <div>
                      receive $1 of native blockchain tokens in your MetaMask wallet (
                      <span className="group link">
                        <span>why is this helpful?</span>
                        <div className="invisible group-hover:visible absolute bottom-[24px] left-0 w-full px-4 py-2 text-lg xs:text-sm leading-tight text-black bg-white border border-blue-400 rounded-lg">
                          To send stablecoins out of your MetaMask, you need to pay a small transaction fee (~$0.01-0.05). This fee is paid in the native blockchain token.
                          Therefore, you will need a small amount of these tokens in your MetaMask wallet before you can send stablecoins out of it.
                        </div>
                      </span>
                      {/*---TODO: set onclick modal---*/}
                      ), instead of <span className="link">manually getting them yourself</span>
                    </div>
                  </div>
                  <div className="mt-1 flex">
                    <div className="mr-2">&bull;</div>
                    <div>receive emails of purchase orders (if your payment type is "Online Payments")</div>
                  </div>
                  <div className="mt-1 flex relative">
                    <div className="mr-2">&bull;</div>
                    <div>
                      pricing: $0-5 per month (
                      <span className="link group">
                        see details
                        <div className="invisible group-hover:visible absolute bottom-[24px] left-0 w-full px-4 py-2 text-lg xs:text-sm leading-tight text-black bg-white border border-blue-400 rounded-lg">
                          At the end of each month, if your monthly transactions are &ge; 500 USD, 5 USDC will be deducted from your balance. If your monthly transactions are &lt;
                          500 USD, then 0 USDC will be deducted from your balance for that month.
                        </div>
                      </span>
                      )
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default DepositAddressModal;
