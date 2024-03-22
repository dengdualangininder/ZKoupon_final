import React from "react";

const TradeBinanceP2P = () => {
  return (
    <div className="">
      <div className="mt-0">To continue, you need to have verified your identity and included a phone number (see Step 4, Substep 1).</div>

      <div>
        <div className="mt-4 ">
          To sell USDT on Binance's P2P marketplace, watch this video (
          <a
            href="https://www.binance.com/en/support/faq/how-to-buy-cryptocurrency-on-binance-p2p-website-360043832851"
            target="_blank"
            className="text-blue-500 underline hover:text-blue-800"
          >
            using website
          </a>{" "}
          |{" "}
          <a
            href="https://www.binance.com/en/support/faq/how-to-buy-cryptocurrency-via-p2p-trading-on-binance-app-360039384951"
            target="_blank"
            className="text-blue-500 underline hover:text-blue-800"
          >
            using mobile app
          </a>
          )
        </div>
      </div>

      <div className="pt-3">Other useful guides:</div>
      <div className="">
        <a
          href="https://www.binance.com/en/blog/p2p/binance-p2p-newbie-guide-7428324997079645557"
          target="_blank"
          className="text-blue-500 underline hover:text-blue-800"
        >
          Binance's P2P Newbie Guide
        </a>
      </div>
    </div>
  );
};

export default TradeBinanceP2P;
