import React from "react";
import sendMAX1 from "../../assets/sendMAX1.png";
import sendMAX2 from "../../assets/sendMAX2.png";

const SendMAX = () => {
  return (
    <div>
      {/*---1---*/}
      <div className="pb-3 flex">
        <div className="modalNumber">1.</div>
        <div className="flex flex-col">
          <div>在您的加密貨幣交易所中，找穩定幣的存款地址:</div>
          <div className="ml-2 flex flex-col">
            <div>在MAX主頁上方，點“錢包”。在USDT或USDC的右邊，點“入金”。</div>
            <img src={sendMAX1} className="rounded-xl border border-slate-400" />
            <div className="pt-2 mt-3 border-t">選區塊鏈(Polygon 或 BSC)。點”複製”。</div>
            <img src={sendMAX2} className="rounded-xl border border-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMAX;
