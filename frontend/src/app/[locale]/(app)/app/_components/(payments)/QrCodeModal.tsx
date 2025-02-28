"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { PaymentSettings } from "@/db/UserModel";

export default function QrCodeModal({ paymentSettings, setQrCodeModal }: { paymentSettings: PaymentSettings; setQrCodeModal: any }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="z-[10]">
      <div className="fixed inset-0 bg-black">
        {/*--- close button ---*/}
        <div
          className="qrCodeModalIconContainer top-[8px] right-[8px] portrait:sm:top-[32px] portrait:sm:right-[32px] landscape:lg:top-[32px] landscape:lg:right-[32px]"
          onClick={() => setQrCodeModal(false)}
        >
          <div className="text-4xl text-white">&#10005;</div>
        </div>
      </div>

      {/*--- placard ---*/}
      <div className="portrait:w-full portrait:h-[calc(100vw*1.4142)] landscape:w-[calc(100vh/1.4142)] portrait:max-w-[560px] portrait:max-h-[calc(560px*1.4142)] landscape:h-screen fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-[11]">
        <div className="w-full h-full relative">
          <Image src="/placard.svg" alt="placard" fill priority onLoad={() => setIsLoaded(true)} />
        </div>
      </div>

      {/*--- qr code ---*/}
      {isLoaded && (
        <div className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[12]">
          <QRCodeSVG
            xmlns="http://www.w3.org/2000/svg"
            size={
              window.innerWidth > window.innerHeight
                ? Math.round((window.innerHeight / 1.4142) * (210 / 424.26))
                : window.innerWidth > 560
                ? Math.round(560 * 1.4142 * (210 / 424.26))
                : Math.round(window.innerWidth * (210 / 424.26))
            }
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            value={paymentSettings?.qrCodeUrl ?? ""}
          />
        </div>
      )}
    </div>
  );
}
