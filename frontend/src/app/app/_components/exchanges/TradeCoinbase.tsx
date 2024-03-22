import React, { useState } from "react";
import tradeCoinbase1 from "../../assets/tradeCoinbase1.png";
import tradeCoinbase2 from "../../assets/tradeCoinbase2.png";
import tradeCoinbase3 from "../../assets/tradeCoinbase3.png";
import tradeCoinbase4 from "../../assets/tradeCoinbase4.png";
import tradeCoinbase5 from "../../assets/tradeCoinbase5.png";
import fundCoinbase2 from "../../assets/fundCoinbase2.png";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleDown, faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

const TradeKraken = () => {
  const [expand, setExpand] = useState(false);

  return (
    <div>
      <div className="flex pb-3">
        <div className="modalNumber">1.</div>
        <div className="">
          <div>Convert USDC to USD (1:1 rate, no fees)</div>
          <div className="flex flex-col items-center">
            <img src={tradeCoinbase1} className="mt-2 border border-slate-400 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={tradeCoinbase2} className="border border-slate-400 rounded-2xl" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={tradeCoinbase3} className="border border-slate-400 rounded-2xl mb-1" />
          </div>
        </div>
      </div>

      <div className="flex py-3 border-t border-slate-400">
        <div className="modalNumber">2.</div>
        <div className="">
          <div>Transfer money to your bank</div>
          <div className="flex flex-col items-center">
            <img src={tradeCoinbase4} className="border border-slate-400 rounded-2xl mb-1" />
          </div>
          <div className="mt-2">Then, follow the instructions to transfer USD to your bank (no fees).</div>
        </div>
      </div>

      <div className="flex flex-col pt-6 pb-4 border-t border-slate-400">
        <div onClick={() => setExpand(!expand)} className="link">
          How do I convert USDT to USD?
          <span>
            {expand ? (
              <FontAwesomeIcon icon={faAngleUp} className="text-lg ml-2 align-middle" />
            ) : (
              <span>
                <FontAwesomeIcon icon={faAngleDown} className="text-lg ml-2 align-middle" />
              </span>
            )}
          </span>
        </div>
        <div className={`${expand ? "max-h-[1000px]" : "max-h-0"} overflow-hidden trasition-all duration-500 ease-in-out`}>
          <div className="flex py-3">
            <div className="modalNumber">1.</div>
            <div className="">
              <div>Go to "Advanced Trading" and trade USDT for USD:</div>
              <div className="flex flex-col items-center">
                <img src={fundCoinbase2} className="mt-2 border border-slate-400 rounded-2xl" />
                <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
                <img src={tradeCoinbase5} className="border border-slate-400 rounded-2xl mb-1" />
              </div>
              <div className="mt-1">"Advanced Trading" has lower fees (0.60% vs. 1.5% when you use Coinbase's standard buy/sell function).</div>
            </div>
          </div>
        </div>
        <div className="mb-4"></div>
      </div>
    </div>
  );
};

export default TradeKraken;
