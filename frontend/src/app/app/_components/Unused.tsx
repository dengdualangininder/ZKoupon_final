"use client";
import Image from "next/image";

const Unused = () => {
  return (
    <div className="mt-4 sm:mt-0 lg:ml-2 w-full flex flex-col sm:flex-row lg:justify-center items-center">
      {/*---PLACARD---*/}
      <div className="flex flex-col items-center">
        {/*---header---*/}
        <div className="text-lg text-gray-700 font-bold">Your QR code placard</div>
        {/*---placard svg---*/}
        <div className="mt-1 relative">
          <div className="w-[210px] h-[308px]">
            <Image src="/placardCoinbaseUSDCCashback.svg" alt="placard" fill />
          </div>
          <QRCodeSVG
            id="qrsvg"
            xmlns="http://www.w3.org/2000/svg"
            size={104}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            value={url}
            className="absolute top-[100px] left-[53px]"
          />
        </div>
        {/*---download button or payment link---*/}
        {paymentSettingsState.merchantPaymentType == "inperson" && (
          <div className="flex flex-col items-center">
            <button
              className="mt-0 w-[200px] h-[56px] xs:h-[44px] text-lg xs:text-base font-bold text-white bg-blue-500 lg:hover:bg-blue-600 rounded-full"
              onClick={downloadPlacardPdf}
            >
              Download
            </button>
            <div className="mt-2 link" onClick={() => setFigmaModal(true)}>
              Customize your placard
            </div>
          </div>
        )}
        {paymentSettingsState.merchantPaymentType == "online" && (
          <button id="accountcopylink" className={`${paymentSettingsState.merchantPaymentType === "online" ? "" : "hidden"} mt-1 w-full relative`} onClick={onClickPaymentLink}>
            <div className="w-full bg-blue-500 py-2 rounded-md text-white font-bold text-center hover:bg-blue-600 cursor-pointer">
              <FontAwesomeIcon icon={faCopy} className="mr-1" /> Copy Payment Link
            </div>
            {popup === "copyLinkButton" && (
              <div className="absolute bottom-[48px] left-[calc(50%-60px)] w-[120px] bg-white px-2 py-1 rounded-lg">
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" /> link copied
              </div>
            )}
          </button>
        )}
      </div>
      {/*---arrows---*/}
      <div className="my-4 md:my-0 sm:h-[280px] flex items-center text-slate-700">
        <div className="px-1 flex flex-row-reverse sm:flex-col items-center">
          {paymentSettingsState.merchantPaymentType === "inperson" && <div className="w-[72px] text-sm text-center font-bold">customer scans QR code</div>}
          {paymentSettingsState.merchantPaymentType === "online" && (
            <div className="w-[150px] sm:w-[72px] text-sm text-center font-bold leading-tight sm:leading-normal">
              <p>customer clicks link</p>
              <p>or scans QR code</p>
            </div>
          )}
          <div className="hidden sm:block">
            <FontAwesomeIcon icon={faArrowRightLong} className="text-3xl" />
          </div>
          <div className="sm:hidden">
            <FontAwesomeIcon icon={faArrowDownLong} className="text-3xl" />
          </div>
        </div>
      </div>
      {/*---UI---*/}
      <div className="sm:mt-4 lg:mt-0 flex flex-col items-center">
        <MockUI
          merchantName={paymentSettingsState.merchantName}
          merchantCurrency={paymentSettingsState.merchantCurrency}
          merchantPaymentType={paymentSettingsState.merchantPaymentType}
          merchantBusinessType={paymentSettingsState.merchantBusinessType}
          merchantWebsite={paymentSettingsState.merchantWebsite}
          merchantFields={paymentSettingsState.merchantFields}
        />
      </div>

      {paymentSettingsState.merchantPaymentType == "inperson" && paymentSettingsState.merchantName && (
        <div className="mt-4 xs:text-sm">Your QR Code is ready! Click "My QR Code" on top to download/email it or customize it.</div>
      )}
      {paymentSettingsState.merchantPaymentType == "online" && paymentSettingsState.merchantName && paymentSettingsState.merchantWebsite && (
        <div className="mt-4">Your QR Code is ready! Click "My Payment Link" or "My QR Code" on top for integration instructions.</div>
      )}
    </div>
  );
};

export default Unused;
