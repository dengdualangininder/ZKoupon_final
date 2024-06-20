"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faCashRegister } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnFive = () => {
  const [read, setRead] = useState(false);
  const handleOnClickStart = () => {
    document.getElementById("startEl").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleOnClickAuto = () => {
    document.getElementById("automationEl").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="learnContainer">
      <div className="flex items-center text-darkblue">
        <FontAwesomeIcon className="learnIcon" icon={faCashRegister} />
        <div className="flex flex-col w-full">
          <div className="learnLessonWord">Lesson 5</div>
          <div className="flex justify-between">
            <div className="learnLessonTitle">What is a cryptocurrency exchange?</div>
            <div onClick={() => setRead(!read)} className="learnLearnWord">
              Learn
              <span>
                {read ? (
                  <FontAwesomeIcon icon={faAngleUp} className="text-xl ml-2 align-middle" />
                ) : (
                  <span>
                    <FontAwesomeIcon icon={faAngleDown} className="text-xl ml-2 align-middle" />
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`${read ? "block" : "hidden"} learnChip mt-1`}>
        <div>
          For payment, customers will send currency-backed stablecoins to the business's MetaMask wallet. Business can then convert these tokens to the local currency on a <span className="font-bold">cryptocurrency exchange</span> and withdraw the
          money to their bank.
        </div>
        <div className="mt-1 sm:mt-3">Your account on the exchange will come with a blockchain address, so you can easily send tokens from your MetaMask wallet to your cryptocurrency exchange.</div>
        <div className="mt-1 sm:mt-3 relative">
          Sending tokens, converting them to the local currency, and withdrawing the money can take 5-10 minutes. Ling Pay provides{" "}
          <span className="link" onClick={handleOnClickAuto}>
            a service to automate all steps
          </span>{" "}
          to help businesses save time.
        </div>
        <div className="mt-1 sm:mt-3 relative">
          After a customer pays, the money can appear in your bank in ~24 hours (or within minutes if you use the exchange's{" "}
          <span className="link group">
            P2P marketplace
            <div className="w-[90%] text-base p-2 pointer-events-none absolute invisible group-hover:visible leading-tight bg-slate-100 text-slate-600 border border-slate-600 rounded-lg">
              Large cryptocurrency exchanges, like Binance or Bybit, have a peer-to-peer (P2P) marketplace. On this marketplace, you can find vendors who are willing send you the local currency (via bank transfer) in exchange for USDC/USDT. Vendors
              are verified and rates are usually very good.
            </div>
          </span>
          ). Compared to the 3-day withholding period of credit cards, this is pretty fast!
        </div>

        <div className="mt-1 sm:mt-3">
          To find out which cryptocurrency exchanges are most suitable for you (it depends on your country and currency), visit Step 4 of our{" "}
          <span>
            <button onClick={handleOnClickStart} className="gradientButtonSmall">
              Get Started
            </button>
          </span>{" "}
          section.
        </div>

        <p className="mt-1 sm:mt-3"> </p>
      </div>
    </div>
  );
};

export default LearnFive;
