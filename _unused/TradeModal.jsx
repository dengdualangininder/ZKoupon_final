import React, { useState, useEffect } from "react";
import TradeMAX from "../frontend/src/app/app/_components/exchanges/TradeMAX.js";
import TradeKraken from "../frontend/src/app/app/_components/exchanges/TradeKraken.js";
import TradeCoinbase from "../frontend/src/app/app/_components/exchanges/TradeCoinbase.js";
import TradeBinanceP2P from "../frontend/src/app/app/_components/exchanges/TradeBinanceP2P.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const TradeModal = ({ setTradeModal, CEX }) => {
  return (
    <div>
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setTradeModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to convert stablecoins to the local currency and withdraw money to your bank</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            {/*---text---*/}
            <div className="flex flex-col">
              {/*---select country/currency---*/}
              <div className="flex justify-center">
                Your cryptocurrency exchange: <span className="ml-2">{CEX}</span>
              </div>
              {/*---CEX suggestions---*/}
              {CEX === "Coinbase Exchange" && <TradeCoinbase />}
              {CEX === "MAX Exchange" && <TradeMAX />}
              {CEX === "Kraken Exchange" && <TradeKraken />}
              {["Coinbase Exchange", "MAX Exchange", "Kraken Exchange"].includes(CEX) && <TradeCoinbase />}
            </div>
          </div>
        </div>
      </div>

      <div className="modalBlackout"></div>
    </div>
  );
};

export default TradeModal;
