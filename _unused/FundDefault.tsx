import React from "react";
import mmScreenshot from "../../assets/mmScreenshot.png";

const FundDefault = () => {
  return (
    <div>
      <div className="pb-3 flex">
        <div className="mr-3">1.</div>
        <div>
          On your cryptocurrency exchange, find and click the "Deposit" function to transfer in ~$10 worth of fiat currency from your bank. Then, buy
          $5-10 worth of the MATIC token.
        </div>
      </div>
      <div className="py-3 flex border-t border-slate-300">
        <div className="mr-3">2.</div>
        <div>
          Find and click the "Withdraw" function on your cryptocurrency exchange to send MATIC to your MetaMask wallet.
          <div className="">
            <div className="flex">
              <p className="mr-2">&#x2022;</p>
              <p>make sure to select the correct network (in this case, "Polygon")</p>
            </div>
            <div className="flex">
              <p className="mr-2">&#x2022;</p>
              <p>for the destination address, enter your MetaMask address (copy the address by clicking the red box in the picture below)</p>
            </div>
            <div className="flex">
              <p className="mr-2">&#x2022;</p>
              <p>Wait 2-5 minutes for the tokens to appear in your MetaMask</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <img src={mmScreenshot} className="mt-2 w-[280px] border border-slate-300 rounded-2xl mb-4" />
      </div>
    </div>
  );
};

export default FundDefault;
