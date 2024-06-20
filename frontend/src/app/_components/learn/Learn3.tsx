"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnThree = () => {
  const [read, setRead] = useState(false);

  const handleOnClick = () => {
    document.getElementById("travelEl").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="learnContainer">
      <div className="flex items-center text-darkblue">
        <FontAwesomeIcon className="learnIcon" icon={faHandHoldingDollar} />
        <div className="flex flex-col w-full">
          <div className="learnLessonWord">Lesson 3</div>
          <div className="flex justify-between">
            <div className="learnLessonTitle">How do I send or receive tokens? </div>
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
        <div>From your MetaMask wallet, you can send tokens to any address. To receive tokens, you will have to give the sender your address.</div>
        <div className="mt-2 sm:mt-3">The sender (the customer) pays a small transaction fee. The receiver (the Business) pays zero fees. The sender fee is very small ($0.01 to $0.03 on the Polygon blockchain).</div>
        <div className="mt-2 sm:mt-3">
          Here, we see the power of blockchain. <span className="font-bold">Sending tokens like USDC (which represents real money) to anyone in the world costs almost nothing.</span> Other services charge $5-20 or 2-5% in fees.
        </div>
        <div className="mt-2 sm:mt-3">
          Furthermore, international travelers can also save 2-5% on FX fees (
          <span onClick={handleOnClick} className="link">
            how?
          </span>
          ).
        </div>
        <div className="mt-2 sm:mt-3">It is a win-win for everyone, except the banks and payment companies, who profit from these fees.</div>
      </div>
    </div>
  );
};

export default LearnThree;
