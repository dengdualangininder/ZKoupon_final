// nextjs
import Image from "next/image";
// types
import { PaymentSettings } from "@/db/models/UserModel";

const FlashToBankAnimation = ({ paymentSettingsState }: { paymentSettingsState: PaymentSettings }) => {
  return (
    <div className="pb-[8px] w-[330px] h-[128px] flex justify-between items-end text-center font-medium flex-none relative">
      {/*--- flash ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[52px] h-[68px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[52px] h-[68px] animate-flashSolid">
            <Image src="/ani-flash-solid.svg" alt="flashSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[52px] h-[68px] animate-flashOutline">
            <Image src="/ani-flash-outline.svg" alt="flashOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-[-14px] animate-flashText text-center text-[18px]">Flash</div>
        </div>
      </div>

      {/*--- arrow ---*/}
      <div className="text-[16px] mx-[8px] w-full h-full flex item-center justify-center z-[1]">
        <div className="mt-[48px] w-full flex items-center z-[1] relative">
          <div className="w-full h-[2px] bg-black animate-arrow"></div>
          <div className="absolute pb-[24px] animate-usdc">USDC</div>
          <div className="absolute pb-[24px] animate-fiat">{paymentSettingsState.merchantCurrency}</div>
        </div>
      </div>

      {/*--- bank ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[68px] h-[68px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-bankSolid">
            <Image src="/ani-bank-solid.svg" alt="bankSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-bankOutline">
            <Image src="/ani-bank-outline.svg" alt="bankOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-[-14px] animate-bankText text-center text-[18px]">Bank</div>
        </div>
      </div>

      {/*--- exchange ---*/}
      <div className="absolute left-[-5px] top-[22px] w-full flex justify-center">
        <div className="text-base w-full absolute bottom-[calc(100%+0px)] text-blue-500 animate-cexText">Coinbase</div>
        <div className="w-[32px] h-[32px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[32px] h-[32px] animate-cexSolid">
            <Image src="/ani-exchange-solid.svg" alt="cexSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[32px] h-[32px] animate-cexOutline">
            <Image src="/ani-exchange-outline.svg" alt="cexOutline" fill />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashToBankAnimation;
