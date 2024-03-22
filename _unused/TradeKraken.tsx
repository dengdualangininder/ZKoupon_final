import React from "react";
import krakenVerify from "../../assets/krakenVerify.webp";
import krakenTransfer from "../../assets/krakenTransfer.png";
import krakenTrade1 from "../../assets/krakenTrade1.png";
import krakenTrade2 from "../../assets/krakenTrade2.png";

const TradeKraken = () => {
  return (
    <div>
      {/*---1---*/}
      <div className="pb-3 flex">
        <div className="modalNumber">1.</div>
        <div className="w-full">
          <div>In your Kraken account, go to "Kraken Pro" (top right)</div>
          <div className="flex justify-center">
            <img src={krakenTrade1} className="mt-1 mb-1 w-[400px] rounded-xl border border-slate-400" />
          </div>
        </div>
      </div>
      {/*---2---*/}
      <div className="py-3 mb-4 border-t flex">
        <div className="modalNumber">2.</div>
        <div>
          <div>On the trading interface, sell stablecoins for EUR:</div>
          {/*---substeps---*/}
          <div className="ml-4 text-sm">
            <div className="flex">
              <div className="mr-1.5 flex">1.</div>
              <div>Select the stablecoin/EUR pair (top left)</div>
            </div>
            <div className="flex">
              <div className="mr-1.5 flex">2.</div>
              <div>
                Select "Sell" and select "Market".{" "}
                <a
                  href="https://support.kraken.com/hc/en-us/articles/7570598822932-Market-and-limit-orders"
                  target="_blank"
                  className=" text-blue-500 underline hover:text-blue-800"
                >
                  Learn about "Market" and "Limit" orders
                </a>
              </div>
            </div>
            <div className="flex">
              <div className="mr-1.5 flex">3.</div>
              <div>Enter the amount of stablecoins to sell</div>
            </div>
            <div className="flex">
              <div className="mr-1.5 flex">4.</div>
              <div>Click the "Sell" button</div>
            </div>
          </div>
          <img src={krakenTrade2} className="mt-1 rounded-xl border border-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default TradeKraken;
