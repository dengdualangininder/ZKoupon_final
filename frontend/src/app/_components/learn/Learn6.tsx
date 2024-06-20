"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faTrophy } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnSix = () => {
  const [read, setRead] = useState(false);

  return (
    <div className="learnContainer">
      <div className="flex items-center text-darkblue">
        <FontAwesomeIcon className="learnIcon" icon={faTrophy} />
        <div className="flex flex-col w-full">
          <div className="learnLessonWord">Lesson 6</div>
          <div className="flex justify-between">
            <div className="learnLessonTitle">Why is Ling Pay important?</div>
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
        <div>If you have a blockchain address, customers can already send tokens to you directly, without needing anyone else. Why is Ling Pay important?</div>
        <div className="mt-1 sm:mt-3">
          Currently, blockchain payments have many friction points. For one, most blockchain users transact in USDC or USDT. In non-USD countries, Businesses and customers will have to verbally agree on how much USDC/USDT is fair payment. Businesses
          also need to convert tokens to the local currency, a time-consuming process.
        </div>
        <div className="mt-1 sm:mt-3">
          Ling Pay smooths over the entire blockchain payments process, so customers can pay in the <span className="font-bold">local currency</span> and businesses can automatically receive money in the bank. The best way to understand how
          everything works is trying it out yourself. Setting up is free and only takes 5 minutes.
        </div>
      </div>
    </div>
  );
};

export default LearnSix;
