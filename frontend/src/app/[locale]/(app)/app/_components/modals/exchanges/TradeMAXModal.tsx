import React from "react";
import Image from "next/image";
// other
import { useTranslations } from "next-intl";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const TradeMAXModal = ({ setTradeMAXModal }: { setTradeMAXModal: any }) => {
  // hooks
  const t = useTranslations("App.InstructionsModal");

  return (
    <div className="instructionsModal z-[92]">
      {/*--- header ---*/}
      <div className="detailsModalHeader">{t("cashout-tradeMAX")}</div>
      {/*--- mobile back ---*/}
      <div className="mobileBack">
        <FontAwesomeIcon icon={faAngleLeft} onClick={() => setTradeMAXModal(false)} />
      </div>
      {/*--- tablet/desktop close ---*/}
      <div className="xButtonContainer" onClick={() => setTradeMAXModal(false)}>
        <div className="xButton">&#10005;</div>
      </div>
      {/*--- content ---*/}
      <div className="w-full px-[16px] portrait:sm:px-[32px] landscape:lg:px-8 flex flex-col overflow-y-auto scrollbar textLg font-medium">
        <div className="py-2 flex">
          <div className="modalNumber">1.</div>
          <div className="w-full">
            <div>在MAX 賬戶的上方，點“交易”</div>
            <div className="mt-1 mb-1 flex justify-center">
              <Image src={"/tradeMAX1.png"} alt="trade MAX 1" width="0" height="0" sizes="100vw" className="w-full h-auto rounded-xl border border-slate-400 overflow-hidden" />
            </div>
          </div>
        </div>
        {/*---2---*/}
        <div className="py-2 border-t flex">
          <div className="modalNumber">2.</div>
          <div className="flex flex-col">
            <div>賣出USDC/買入TWD</div>
            {/*---substeps---*/}
            <div className="ml-4">
              <div className="flex">
                <div className="mr-2">1.</div>
                <div>在左側，點 "USDC/TWD"</div>
              </div>
              <div>
                <div className="flex">
                  <div className="mr-2">2.</div>
                  <div>在右下角，點 "市價"</div>
                </div>
                <div className="flex">
                  <div className="mr-2">3.</div>
                  <div>輸入USDC數量</div>
                </div>
                <div className="flex">
                  <div className="mr-2">4.</div>
                  <div>點 "賣出"</div>
                </div>
              </div>
            </div>
            {/*---image---*/}
            <div className="w-full flex justify-center">
              <div className="mt-1 mb-1 flex justify-center">
                <Image src={"/tradeMAX2.png"} alt="trade MAX 2" width="0" height="0" sizes="100vw" className="w-full h-auto rounded-xl border border-slate-400 overflow-hidden" />
              </div>
            </div>
          </div>
        </div>
        {/*----3--*/}
        <div className="py-2 mb-2 border-t flex">
          <div className="modalNumber">3.</div>
          <div className="w-full">
            <div>點"錢包"(上方)返回主頁。點"提領"。按照指示進行提領。</div>
            <div className="flex justify-center">
              <div className="mt-1 mb-1 flex justify-center">
                <Image src={"/tradeMAX3.png"} alt="trade MAX 3" width="0" height="0" sizes="100vw" className="w-full h-auto rounded-xl border border-slate-400 overflow-hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeMAXModal;
