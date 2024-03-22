"use client";
import FundCoinbase from "../exchanges/FundCoinbase.jsx";
import FundDefault from "../exchanges/FundDefault.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faArrowCircleDown } from "@fortawesome/free-solid-svg-icons";
import { countryData } from "../../constants";

const FundModal = ({ setFundModal, CEX }) => {
  return (
    <div>
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setFundModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to "fund" your MetaMask wallet</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            <div className="mt-3">After a customer pays, stablecoins will be in your MetaMask wallet.</div>
            <div className="mt-2 relative">
              To transfer the stablecoins out of MetaMask, a small transaction fee (for example, ~$0.02 on Polygon) must be paid. The fee is paid in the blockchain's{" "}
              <span className="font-bold">native token</span>, so you will need a small amount of this token in your MetaMask first.{" "}
              <span className="group">
                <span className="link">What are the native tokens for each blockchain?</span>
                <div className="invisible group-hover:visible bottom-[50px] p-2 sm:mt-2 pointer-events-none absolute bg-slate-200 border border-slate-500 rounded-lg">
                  Polygon=MATIC, BNB Chain=BNB, Base=ETH, Optimism=ETH, Arbitrum=ETH, Avalanche=AVAX
                </div>
              </span>
            </div>
            <div className="mt-3 px-3 py-1.5 border border-red-400 text-red-500 font-bold rounded-xl">
              If you activated the Automation Package, $1 worth of native blockchain tokens (which is enough for ~10-30 transactions) will be automatically sent your MetaMask
              wallet. Therefore, you can skip this step.
            </div>
            <div className="mt-3 font-bold mb-2">How to get native tokens (for example, MATIC) into your MetaMask?</div>
            {/*---CEX suggestions---*/}
            {CEX === "Coinbase Exchange" && <FundCoinbase />}
            {CEX != "Coinbase Exchange" && <FundDefault />}
            <div className="mb-4"></div>
          </div>
        </div>
      </div>

      <div className="modalBlackout"></div>
    </div>
  );
};

export default FundModal;
