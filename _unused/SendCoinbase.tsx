import React from "react";
import sendCoinbase1 from "../../assets/sendCoinbase1.png";
import sendCoinbase2 from "../../assets/sendCoinbase2.png";
import sendCoinbase3 from "../../assets/sendCoinbase3.png";
import sendCoinbase4 from "../../assets/sendCoinbase4.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleDown } from "@fortawesome/free-solid-svg-icons";

const SendMAX = () => {
  return (
    <div>
      {/*---1---*/}
      <div className="pb-3 flex">
        <div className="modalNumber">1.</div>
        <div className="flex flex-col">
          <div>On Coinbase, copy the stablecoin's (for example, USDC) deposit address:</div>
          <div className="ml-2 flex flex-col">
            <img src={sendCoinbase1} className="mt-2 rounded-xl border border-slate-400" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={sendCoinbase2} className="rounded-xl border border-slate-400" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={sendCoinbase3} className="rounded-xl border border-slate-400" />
            <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
            <img src={sendCoinbase4} className="rounded-xl border border-slate-400 mb-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMAX;
