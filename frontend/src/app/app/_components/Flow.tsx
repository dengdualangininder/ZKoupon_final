// nextjs
import Image from "next/image";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Flow = ({ paymentSettingsState, cashoutSettingsState }: { paymentSettingsState: PaymentSettings; cashoutSettingsState: CashoutSettings }) => {
  return (
    <div className="my-8 w-[240px] h-[240px] grid grid-cols-[80px_80px_80px] text-xs [font-weight:600] text-center flex-none">
      {/*--- metamask ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[80px] h-[80px] flex items-center justify-center relative">
          {/*--- box ---*/}
          <div className="w-full h-full rounded-md border border-gray-400 flex justify-center items-center relative">
            <div className="absolute w-full h-full animate-metamaskBox rounded-md"></div>
          </div>
          {/*--- solid img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-metamaskSolid">
            <Image src="/ani-flash-solid.svg" alt="metamaskSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-metamaskOutline">
            <Image src="/ani-flash-outline.svg" alt="metamaskOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-0 animate-metamaskText">Customer</div>
        </div>
      </div>
      {/*--- arrow right ---*/}
      <div className="w-full h-[80px] relative flex items-center justify-center z-[0]">
        <div className="absolute left-[-80px] w-[80px] h-[2px] bg-black animate-arrowRight"></div>
        <div className="absolute w-full pl-2 pb-6 animate-usdc1">USDC</div>
      </div>
      {/*--- flash ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[80px] h-[80px] flex items-center justify-center relative">
          {/*--- outline ---*/}
          <div className="w-full h-full rounded-md border border-gray-400 flex justify-center items-center relative">
            <div className="absolute w-full h-full animate-flashBox rounded-md"></div>
          </div>
          {/*--- solid img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-flashSolid">
            <Image src="/ani-flash-solid.svg" alt="flashSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-flashOutline">
            <Image src="/ani-flash-outline.svg" alt="flashOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-0 animate-flashText">Flash App</div>
        </div>
      </div>
      {/*--- SECOND ROW ---*/}
      {/*--- blank ---*/}
      <div className="h-[80px]"></div>
      {/*--- blank ---*/}
      <div></div>
      {/*--- arrow down---*/}
      <div className="h-[80px] relative flex items-center justify-center z-[0]">
        <div className="absolute top-[-80px] w-[2px] h-[80px] bg-black animate-arrowDown"></div>
        <div className="absolute left-[50px] pt-2 animate-usdc2">USDC</div>
      </div>
      {/*--- THIRD ROW ---*/}
      {/*--- bank ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[80px] h-[80px] flex items-center justify-center relative">
          {/*--- outline ---*/}
          <div className="w-full h-full rounded-md border border-gray-400 flex justify-center items-center relative">
            <div className="absolute w-full h-full animate-bankBox rounded-md"></div>
          </div>
          {/*--- solid img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-bankSolid">
            <Image src="/ani-flash-solid.svg" alt="bankSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-bankOutline">
            <Image src="/ani-flash-outline.svg" alt="bankOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-0 animate-bankText">Bank</div>
        </div>
      </div>
      {/*--- arrow left ---*/}
      <div className="h-[80px] relative flex items-center justify-center z-[0]">
        <div className="absolute right-[-80px] w-[80px] h-[2px] bg-black animate-arrowLeft"></div>
        <div className="absolute w-full pb-6 animate-fiat">{paymentSettingsState.merchantCurrency}</div>
      </div>
      {/*--- cex ---*/}
      <div className="flex flex-col items-center z-[1]">
        <div className="w-[80px] h-[80px] flex items-center justify-center relative">
          {/*--- outline ---*/}
          <div className="w-full h-full rounded-md border border-gray-400 flex justify-center items-center relative">
            <div className="absolute w-full h-full animate-cexBox rounded-md"></div>
          </div>
          {/*--- solid img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-cexSolid">
            <Image src="/ani-flash-solid.svg" alt="cexSolid" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[37px] h-[72px] animate-cexOutline">
            <Image src="/ani-flash-outline.svg" alt="cexOutline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-0 animate-cexText">{cashoutSettingsState.cex || "Exchange"}</div>
        </div>
      </div>
    </div>
  );
};

export default Flow;
