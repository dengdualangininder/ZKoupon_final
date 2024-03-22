import React from "react";
import krakenVerify from "../../assets/krakenVerify.webp";
import krakenTransfer from "../../assets/krakenTransfer.png";
import krakenTrade1 from "../../assets/krakenTrade1.png";
import krakenTrade2 from "../../assets/krakenTrade2.png";

const signupKraken = () => {
  return (
    <div>
      <div className="py-2 flex">
        <div className="mr-3.5">1.</div>
        <div>
          Register a Kraken account (
          <a
            href="https://support.kraken.com/hc/en-us/articles/226090548-How-to-create-an-account-on-Kraken"
            target="_blank"
            className="text-blue-500 underline hover:text-blue-800"
          >
            www.kraken.com/sign-up
          </a>
          )
        </div>
      </div>

      <div className="py-2 border-t flex">
        <div className="modalNumber">2.</div>
        <div>
          <div>
            Click "Verify identity" and complete the steps. Wait ~1 day for verification to complete.{" "}
            <a
              href="https://support.kraken.com/hc/en-us/articles/360021973671-How-to-get-verified-on-Kraken"
              target="_blank"
              className=" text-blue-500 underline hover:text-blue-800"
            >
              Kraken's identity verification guide
            </a>
          </div>
          <div className="flex justify-center">{/* <img src={krakenVerify} className="mt-2 mb-1 w-full rounded-xl border border-slate-300" /> */}</div>
        </div>
      </div>
    </div>
  );
};

export default signupKraken;
