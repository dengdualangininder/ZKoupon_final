import React from "react";
import fundCoinbase1 from "../../assets/fundCoinbase1.png";
import fundCoinbase2 from "../../assets/fundCoinbase2.png";
import fundCoinbase3 from "../../assets/fundCoinbase3.png";
import fundCoinbase4 from "../../assets/fundCoinbase4.png";
import fundCoinbase5 from "../../assets/fundCoinbase5.png";
import fundCoinbase6 from "../../assets/fundCoinbase6.png";
import fundCoinbase7 from "../../assets/fundCoinbase7.png";
import fundCoinbase8 from "../../assets/fundCoinbase8.png";
import fundCoinbase9 from "../../assets/fundCoinbase9.png";
import mmScreenshot from "../../assets/mmScreenshot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleDown } from "@fortawesome/free-solid-svg-icons";

const FundCoinbase = () => {
  return (
    <div>
      <div className="pb-3 flex">
        <div className="mr-3">1.</div>
        <div>
          <div>In your Coinbase account, transfer in ~$10 from your bank</div>
          <div className="flex justify-center">
            <img src={fundCoinbase1} className="mt-2 border border-slate-300 rounded-2xl mb-1" />
          </div>
        </div>
      </div>

      <div className="py-3 flex border-t">
        <div className="mr-3">2.</div>
        <div>
          <div>Buy $5-10 worth of the native token (for example, MATIC)</div>
          <div className="flex flex-col items-center">
            <img src={fundCoinbase2} className="mt-2 border border-slate-300 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase3} className="border border-slate-300 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase4} className="border border-slate-300 rounded-2xl mb-1" />
          </div>
        </div>
      </div>

      <div className="py-3 flex border-t">
        <div className="mr-3">3.</div>
        <div>
          <div>Send the tokens (MATIC) to your MetaMask</div>
          <div className="flex flex-col items-center">
            <img src={fundCoinbase5} className="mt-2 border border-slate-300 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase6} className="border border-slate-300 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase7} className="border border-slate-300" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase8} className="border border-slate-300 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={fundCoinbase9} className="border border-slate-300 rounded-2xl mb-1" />
          </div>
          <div className="mt-2">Wait 2-3 minutes for the tokens to appear in your MetaMask.</div>
        </div>
      </div>
    </div>
  );
};

export default FundCoinbase;
