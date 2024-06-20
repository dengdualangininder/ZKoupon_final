"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnFour = () => {
  const [read, setRead] = useState(false);

  return (
    <div className="learnContainer md:border-t-2">
      <div className="flex items-center text-darkblue">
        <FontAwesomeIcon className="learnIcon" icon={faSackDollar} />
        <div className="flex flex-col w-full">
          <div className="learnLessonWord">Lesson 4</div>
          <div className="flex justify-between">
            <div className="learnLessonTitle">Are tokens real money?</div>
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
          As mentioned in Lesson 1, USDC is like real money. USDC is an example of a <span className="font-bold">currency-backed stablecoin</span>.
        </div>
        <div className="mt-2 sm:mt-3">
          Currency-backed stablecoins are tokens that are backed by currency in a bank. USDC is a USD-backed stablecoin managed by Circle, a U.S.-based company. Because of strict regulations, 1 USDC can always be redeemed for 1 USD.
        </div>
        <div className="mt-2 sm:mt-3">
          Similarly, EUROC and JPYC are currency-backed stablecoins (also issued by Circle) that represent 1 EURO and 1 JPY, respectively. USDT is a currency-backed stablecoin issued by Tether. Today, USDC and USDT are the most widely used
          currency-backed stablecoins on the blockchain.
        </div>
      </div>
    </div>
  );
};

export default LearnFour;
