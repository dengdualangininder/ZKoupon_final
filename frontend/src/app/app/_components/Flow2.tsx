// nextjs
import Image from "next/image";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Flow = ({ paymentSettingsState, cashoutSettingsState }: { paymentSettingsState: PaymentSettings; cashoutSettingsState: CashoutSettings }) => {
  return (
    <div className="mt-4 w-[360px] h-[240px] grid grid-cols-[80px_60px_80px_60px_80px] text-xs text-center font-medium flex-none">
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
      <div className="w-full h-[60px] relative flex items-center justify-center z-[0]">
        <div className="absolute left-[-60px] w-[60px] h-[2px] bg-black animate-arrowRight"></div>
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
      {/*--- two blanks ---*/}
      <div></div>
      <div></div>

      {/*--- SECOND ROW ---*/}
      {/*--- two blanks ---*/}
      <div></div>
      <div></div>
      {/*--- arrow down---*/}
      <div className="h-[60px] bg-red-300 relative flex items-center justify-center z-[0] flex-none">
        <div className="absolute top-[-60px] w-[2px] h-[60px] bg-black animate-arrowDown"></div>
        <div className="absolute animate-usdc2">USDC</div>
      </div>
      {/*--- two blanks ---*/}
      <div></div>
      <div></div>

      {/*--- THIRD ROW ---*/}

      {/*--- two blanks ---*/}
      <div></div>
      <div></div>

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
          <div className="w-full absolute left-0 bottom-0 animate-cexText">{cashoutSettingsState.cex ?? "Crypto Exchange"}</div>
        </div>
      </div>

      {/*--- arrow right ---*/}
      <div className="w-full h-[60px] relative flex items-center justify-center z-[0]">
        <div className="absolute left-[-60px] w-[60px] h-[2px] bg-black animate-arrowRight"></div>
        <div className="absolute w-full pl-2 pb-6 animate-usdc1">USDC</div>
      </div>

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
    </div>
  );
};

export default Flow;
