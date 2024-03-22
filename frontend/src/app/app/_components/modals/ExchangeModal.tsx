"use client";
import MAX from "../exchanges/MAX";
import Kraken from "../exchanges/Kraken";
import Coinbase from "../exchanges/Coinbase";
import BinanceP2P from "../exchanges/BinanceP2P";
import { countryData } from "@/utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const ExchangeModal = ({ setExchangeModal, CEX }) => {
  const handleSelectCurrency = (e) => {
    if (e.target.value === "select") {
      setCurrency(false);
    } else {
      let selectString = e.target.value;
      let tempCurrency = selectString.split("(")[1].replace(")", "");
      let tempIndex = data.findIndex((i) => i.currency == tempCurrency);
      setModalIndex(tempIndex);
    }
  };

  return (
    <div>
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setExchangeModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to sign up for a cryptocurrency exchange</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            {/*---select currency---*/}
            <div className="pt-2 flex flex-col sm:flex-row items-center">
              Your selected cryptocurrency exchnage: <span className="font-bold">{CEX}</span>
            </div>
            {/*---CEX instructions---*/}
            <div>
              UNDER CONSTRUCTION
              {/* {CEX === "MAX Exchange" && <MAX />}
              {CEX === "Binance Exchange" && <BinanceP2P />}
              {CEX === "Coinbase Exchange" && <Coinbase />}
              {CEX === "Kraken Exchange" && <Kraken />} */}
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ExchangeModal;
