"use client";
import debankScreenshot from "../../assets/debankScreenshot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ConfirmWebModal = ({ setConfirmWebModal }) => {
  return (
    <div className="">
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setConfirmWebModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">Confirm payment by checking a website</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            <div className="flex flex-col">
              {/*---text---*/}
              <div className="flex flex-col space-y-2 sm:space-y-4">
                <div className="text-center">
                  <p className="">Go to this website:</p>
                  <p className="mt-1 break-all text-sm md:text-[13px] mx-4  md:mx-0">https://debank.com/profile/0xf3D49126A9E25724CFE2Ca00bEAa34317543f9aC/history</p>
                </div>
                <div className="">
                  Substitute your own EVM address in the link. For convenience, bookmark the site. Completed transactions will appear here after ~15s of payment. The chain the
                  tokens were sent on is denoted by the chain's icon (see image). Visit{" "}
                  <a href="https://defillama.com/chains" target="_blank" className="link">
                    DeFiLlama
                  </a>{" "}
                  to familiarize yourself with these icons.
                </div>
                <div className="">
                  However, one issue is the payment will not be denoted in fiat currency. How would you know if the customer sent you exactly 100 currency units? If you sign up for
                  our low-cost{" "}
                  <span
                    className="font-bold link"
                    onClick={() => {
                      document.getElementById("automationEl").scrollIntoView({ behavior: "smooth", block: "start" });
                      setConfirmWebModal(false);
                    }}
                  >
                    Automation Package
                  </span>
                  , you can view completed payments in fiat currency units in the Payments tab.
                </div>
              </div>
              {/*---image---*/}
              <div className="mt-4 flex justify-center">
                <img src={debankScreenshot} className="w-[500px] border border-slate-300 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4"></div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ConfirmWebModal;
