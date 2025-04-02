// nextjs
import Image from "next/image";

export default function NullaToBankAnimation({ settings }: { settings: any }) {
  return (
    <div className="pb-[8px] w-[330px] h-[128px] flex justify-between items-end text-center font-medium flex-none relative">
      {/*--- nulla ---*/}
      <div className="flex flex-col items-center z-1">
        <div className="w-[68px] h-[68px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-nulla-solid">
            <Image src="/ani-nulla-solid.svg" alt="logo" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-nulla-outline">
            <Image src="/ani-nulla-outline.svg" alt="logo outline" fill />
          </div>
          <div className="absolute left-[0px] bottom-[-14px] animate-nulla-text text-[16px] whitespace-nowrap">Nulla Pay</div>
        </div>
      </div>

      {/*--- arrow ---*/}
      <div className="text-[16px] mx-[8px] w-full h-full flex item-center justify-center z-1">
        <div className="mt-[48px] w-full flex items-center z-1 relative">
          <div className="w-full h-[2px] bg-black animate-arrow"></div>
          <div className="absolute pb-[24px] animate-usdc">USDC</div>
          <div className="absolute pb-[24px] animate-fiat">{settings.paymentSettings.merchantCurrency}</div>
        </div>
      </div>

      {/*--- bank ---*/}
      <div className="flex flex-col items-center z-1">
        <div className="w-[68px] h-[68px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-bank-solid">
            <Image src="/ani-bank-solid.svg" alt="bank" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[68px] h-[68px] animate-bank-outline">
            <Image src="/ani-bank-outline.svg" alt="bank outline" fill />
          </div>
          <div className="w-full absolute left-0 bottom-[-14px] animate-bank-text text-center text-[16px]">Bank</div>
        </div>
      </div>

      {/*--- exchange ---*/}
      <div className="absolute left-[-5px] top-[22px] w-full flex justify-center">
        <div className="text-base w-full absolute bottom-[calc(100%+0px)] text-blue-500 animate-cex-text">Coinbase</div>
        <div className="w-[32px] h-[32px] flex items-center justify-center relative">
          {/*--- solid img ---*/}
          <div className="absolute w-[32px] h-[32px] animate-cex-solid">
            <Image src="/ani-exchange-solid.svg" alt="CEX" fill />
          </div>
          {/*--- outline img ---*/}
          <div className="absolute w-[32px] h-[32px] animate-cex-outline">
            <Image src="/ani-exchange-outline.svg" alt="CEX outline" fill />
          </div>
        </div>
      </div>
    </div>
  );
}
