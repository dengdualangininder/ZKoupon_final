// nextjs
import Image from "next/image";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Flow = ({ paymentSettingsState, cashoutSettingsState }: { paymentSettingsState: PaymentSettings; cashoutSettingsState: CashoutSettings }) => {
  return (
    <div className="mt-4 w-[330px] flex items-center justify-between text-base text-center font-medium flex-none relative">
      {/*--- flash ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[55px] h-[72px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[55px] h-[72px] animate-flashSolid">
            <Image src="/ani-flash-solid.svg" alt="flashSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[55px] h-[72px] animate-flashOutline">
            <Image src="/ani-flash-outline.svg" alt="flashOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-[-16px] animate-flashText text-center text-lg">Flash</div>
        </div>
      </div>

      {/*--- arrow ---*/}
      <div className="mx-2 w-full flex justify-center z-[1]">
        <div className="w-full flex items-center z-[1] bg-gray-300 relative">
          <div className="w-full h-[2px] bg-black animate-arrow"></div>
          <div className="absolute pb-6 animate-usdc">USDC</div>
          <div className="absolute pb-6 animate-fiat">EUR</div>
        </div>
      </div>

      {/*--- bank ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[72px] h-[80px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[72px] h-[72px] animate-bankSolid">
            <Image src="/ani-bank-solid.svg" alt="bankSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[72px] h-[72px] animate-bankOutline">
            <Image src="/ani-bank-outline.svg" alt="bankOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-[-12px] animate-bankText text-center text-lg">Bank</div>
        </div>
      </div>

      {/*--- exchange ---*/}
      <div className="absolute left-[-5px] bottom-[68px] w-full flex justify-center">
        <div className="w-full absolute bottom-[calc(100%+0px)] text-blue-500 animate-cexText">{cashoutSettingsState.cex ?? "Crypto Exchange"}</div>
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

export default Flow;
