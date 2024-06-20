"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faWallet } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";

const LearnTwo = () => {
  const handleOnClick = () => {
    document.getElementById("startEl").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [read, setRead] = useState(false);

  return (
    <div className="learnContainer">
      <div className="flex items-center text-darkblue">
        <FontAwesomeIcon className="learnIcon" icon={faWallet} />
        <div className="flex flex-col w-full">
          <div className="learnLessonWord">Lesson 2</div>
          <div className="flex justify-between">
            <div className="learnLessonTitle">What is a blockchain account?</div>
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
        Getting a blockchain account is <span className="italic">much easier</span> than getting a bank account. It takes just several minutes. Simply download the <span className="font-bold">MetaMask wallet</span> and create an account (we will show
        you how later).
        <div className="mt-1 sm:mt-3">
          Once you create an account, you will be assigned an <span className="font-bold">address</span>, which looks like this: <span className="break-all">0x709D8145D21681f8287a556C67cD58Cb8A7FB3Aa</span>. An address is like a bank account number.
        </div>
      </div>
    </div>
  );
};

export default LearnTwo;
