import React from "react";
import tradeMAX1 from "../../assets/tradeMAX1.png";
import tradeMAX2 from "../../assets/tradeMAX2.png";

const TradeMAX = () => {
  return (
    <div>
      {/*---1---*/}
      <div className="py-2 border-t flex">
        <div className="modalNumber">1.</div>
        <div className="w-full">
          <div>在MAX 賬戶的上方，點“交易”</div>
          <div className="flex justify-center">
            <img src={tradeMAX1} className="mt-1 mb-1 w-[400px] rounded-xl border border-slate-400" />
          </div>
        </div>
      </div>
      {/*---2---*/}
      <div className="py-2 border-t flex">
        <div className="modalNumber">2.</div>
        <div className="flex flex-col">
          <div>在這界面，把穩定幣換成當地幣</div>
          {/*---substeps---*/}
          <div className="ml-4">
            <div className="flex">
              <div className="mr-2">1.</div>
              <div>在左側，點“USDT/TWD” 或 “USDC/TWD”</div>
            </div>
            <div>
              <div className="flex">
                <div className="mr-2">2.</div>
                <div>在右下角，點“市價”</div>
              </div>

              <div className="flex">
                <div className="mr-2">3.</div>
                <div>輸入穩定幣數量</div>
              </div>

              <div className="flex">
                <div className="mr-2">4.</div>
                <div>點”賣出”</div>
              </div>
            </div>
          </div>
          {/*---image---*/}
          <div className="w-full flex justify-center">
            <img src={tradeMAX2} className="rounded-xl" />
          </div>
        </div>
      </div>
      {/*----3--*/}
      <div className="py-2 mb-2 border-t flex">
        <div className="modalNumber">3.</div>
        <div className="w-full">
          <div>點”錢包”(上方)返回主頁。點”提領”。按照指示進行提領。</div>
          <div className="flex justify-center">
            <img src={tradeMAX1} className="mt-1 mb-1 w-[400px] rounded-xl border border-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeMAX;
