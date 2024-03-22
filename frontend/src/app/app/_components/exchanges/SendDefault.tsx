import React from "react";
import copySvg from "../../assets/copySvg.svg";

const SendDefault = () => {
  return (
    <div className="pb-3 flex">
      <div className="modalNumber">1.</div>
      <div>
        In your cryptocurrency exchange, click the "Deposit" function. Select the stablecoin. Choose the chain where your stablecoins are on. The token's
        deposit address should show. Copy it (click the copy icon <img src={copySvg} className="h-[10px] inline" />
        ).
      </div>
    </div>
  );
};

export default SendDefault;
