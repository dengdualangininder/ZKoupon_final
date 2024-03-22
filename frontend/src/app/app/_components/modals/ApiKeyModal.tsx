"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ApiKeyModal = ({ setApiModal }) => {
  return (
    <div className="">
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setApiModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to get an API key</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            <div className="flex flex-col">
              {/*---text---*/}
              <div className="mt-2">Clicking the "Cash Out" button in the "Cash Out" tab will activate 2 phases:</div>
              <div className="mt-2">Phase 1: Stablecoins will be transferred from MetaMask to your cryptocurrency exchange.</div>
              <div className="mt-2">
                Phase 2: 10-60 minutes later, stablecoins in your cryptocurrency exchange will be converted to the local currency, which is then withdrawn to your bank account.
              </div>
              <div className="mt-2">For our automated system to accomplish Phase 2, you will need to enter your cryptocurrency exchange's API key.</div>
              <div className="mt-2">
                If you leave this "API key" field blank, it is okay. When you click the "Cash Out" button, Phase 1 will still be performed. Phase 2, however, will not be performed.
                To finish Phase 2, go to <span className="link">Step 3 under "Manually Cash Out"</span> to learn how to convert stablecoins to the local currency and make
                withdrawals to your bank.
              </div>
              <div className="mt-2">
                Currently, we are still writing detailed instructions on how you can obtain this API key. If you need help finding it, feel free to talk to one of ours advisors by
                emailing contact@lingpay.io.
              </div>

              <div className="mt-2 text-xl font-bold">FAQs</div>
              <div className="mt-2 font-bold">What is an API key?</div>
              <div className="mt-2">An API key is like a password that allows our automated system to access various functions in your cryptocurrency exchange account.</div>
              <div className="mt-2 font-bold">Is sharing your API key safe?</div>
              <div className="mt-2 mb-8">
                On most cryptocurrency exchanges, you can put limits to your API key, so that we can only make withdrawals to your bank account and not elsewhere. Therefore,
                sharing your API key with us can be secure. Finally, we suggest you "cash out" frequently (daily or weekly or whenever your balance exceeds a threshold), so you
                hopefully will not be leaving a very large sum on your cryptocurrency exchange.
              </div>
              <div className="flex">
                <div></div>
                <div></div>
              </div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ApiKeyModal;
