import React from "react";

const signupBinanceP2P = () => {
  return (
    <div className="">
      <div className="pt-3 pb-3 flex">
        <div className="mr-3.5">1.</div>
        <div>
          Register an account on Binance's{" "}
          <a href="https://www.binance.com/" target="_blank" className="text-blue-500 underline hover:text-blue-800">
            website
          </a>{" "}
          or{" "}
          <a href="https://www.binance.com/en/download" target="_blank" className="text-blue-500 underline hover:text-blue-800">
            mobile app
          </a>{" "}
        </div>
      </div>

      <div className="py-3 flex">
        <div className="mr-3">2.</div>
        <div>
          <div className="">Complete identity verification (go to "Identification" in your profile settings)</div>
          <div>
            <a
              href="https://www.binance.com/en/support/faq/how-to-complete-identity-verification-360027287111"
              target="_blank"
              className="text-blue-500 underline hover:text-blue-800"
            >
              Binance's identity verification guide{" "}
            </a>{" "}
          </div>
        </div>
      </div>

      <div className="py-3 flex">
        <div className="mr-3">3.</div>
        <div>
          <div className="">Add a phone number (go to "Security" in your profile settings)</div>
        </div>
      </div>
    </div>
  );
};

export default signupBinanceP2P;
