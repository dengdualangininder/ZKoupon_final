// nextjs
import { useState } from "react";
import Image from "next/image";
// other
import { QRCodeSVG } from "qrcode.react";
import { renderToStream, pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
// components
import Placard from "../placard/Placard";
// types
import { PaymentSettings, Transaction } from "@/db/models/UserModel";

const qrCodeModal = ({ paymentSettingsState, setQrCodeModal }: { paymentSettingsState: PaymentSettings; setQrCodeModal: any }) => {
  const [qrCodeModalExportOptions, setQrCodeModalExportOptions] = useState(false);
  const [emailModal, setEmailModal] = useState(false);

  const hideQrCodeModalExportOptions = () => {
    setQrCodeModalExportOptions(false);
    document.removeEventListener("click", hideQrCodeModalExportOptions);
  };

  const emailQrCode = async () => {
    // create PDF file blob
    const el = document.getElementById("qrCodeForDownload");
    const dataString = await pdf(
      <Document>
        <Page size="A5" style={{ position: "relative" }}>
          <View>
            <Placard />
          </View>
          <View style={{ position: "absolute", transform: "translate(108, 190)" }}>
            {/* @ts-ignore */}
            <Svg width="210" height="210" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* @ts-ignore */}
              <Path fill="#ffffff" d={el?.children[0].attributes.d.value} shape-rendering="crispEdges"></Path>
              {/* @ts-ignore */}
              <Path fill="#000000" d={el?.children[1].attributes.d.value} shape-rendering="crispEdges"></Path>
            </Svg>
          </View>
        </Page>
      </Document>
    ).toString();

    // create the formData
    const formData = new FormData();
    formData.append("merchantEmail", paymentSettingsState.merchantEmail);
    formData.append("dataString", dataString);

    // send datat to api endpoint
    const res = await fetch("/api/emailQrCode", {
      method: "POST",
      body: formData,
    });

    // api response
    const response = await res.json();
    console.log(response);
    if (response == "email sent") {
      console.log("email sent");
    } else {
      console.log("email did not send");
    }
  };

  const downloadQrCode = async () => {
    const el = document.getElementById("qrCodeForDownload");
    const blob = await pdf(
      <Document>
        <Page size="A5" style={{ position: "relative" }}>
          <View>
            <Placard />
          </View>
          <View style={{ position: "absolute", transform: "translate(108, 190)" }}>
            {/* @ts-ignore */}
            <Svg width="210" height="210" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* @ts-ignore */}
              <Path fill="#ffffff" d={el?.children[0].attributes.d.value} shape-rendering="crispEdges"></Path>
              {/* @ts-ignore */}
              <Path fill="#000000" d={el?.children[1].attributes.d.value} shape-rendering="crispEdges"></Path>
            </Svg>
          </View>
        </Page>
      </Document>
    ).toBlob();
    saveAs(blob, "FlashQrCode");
  };

  return (
    <div className="z-[10]">
      <div className="fixed inset-0 bg-black">
        {/*--- close button ---*/}
        <div className="qrPageIconContainer top-2 right-2 portrait:sm:top-8 portrait:sm:right-8 landscape:lg:top-8 landscape:lg:right-8" onClick={() => setQrCodeModal(false)}>
          <div className="text-4xl text-white">&#10005;</div>
        </div>
        {/*--- export button ---*/}
        <div
          className="qrPageIconContainer bottom-3 left-3 portrait:sm:bottom-8 portrait:sm:left-8 landscape:lg:bottom-8 landscape:lg:left-8"
          onClick={() => {
            if (!qrCodeModalExportOptions) {
              document.addEventListener("click", hideQrCodeModalExportOptions);
            }
            setQrCodeModalExportOptions(true);
          }}
        >
          <div className="relative w-[32px] h-[32px]">
            <Image src="/exportWhite.svg" alt="export" fill />
          </div>
        </div>
      </div>
      {/*--- export options ---*/}
      {qrCodeModalExportOptions && (
        <div className="textXl absolute left-[24px] bottom-[76px] portrait:sm:left-8 portrait:sm:bottom-[110px] landscape:lg:left-8 landscape:lg:bottom-[110px] cursor-pointer bg-background rounded-xl z-[13]">
          <div className="px-6 py-4 landscape:xl:desktop:hover:opacity-50 border-b border-gray-300" onClick={() => setEmailModal(true)}>
            Send PDF File to Email
          </div>
          <div className="px-6 py-4 landscape:xl:desktop:hover:opacity-50" onClick={downloadQrCode}>
            Downlaod PDF File
          </div>
        </div>
      )}
      {/*--- placard ---*/}
      <div className="portrait:w-full portrait:h-[calc(100vw*1.4142)] landscape:w-[calc(100vh/1.4142)] portrait:max-w-[560px] portrait:max-h-[calc(560px*1.4142)] landscape:h-screen fixed inset-1/2 -translate-y-[50%] -translate-x-1/2 z-[11]">
        <div className="w-full h-full relative">
          <Image src="/placard.svg" alt="placard" fill />
        </div>
      </div>
      {/*--- qr code ---*/}
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
          value={paymentSettingsState?.qrCodeUrl ?? ""}
        />
      </div>
      {/*--- qr code for download purposes ---*/}
      <div className="hidden">
        <QRCodeSVG
          id="qrCodeForDownload"
          xmlns="http://www.w3.org/2000/svg"
          size={210}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          value={paymentSettingsState.qrCodeUrl}
        />
      </div>
      {emailModal && (
        <div className="z-[20] relative">
          <div className="w-full portrait:sm:w-[420px] landscape:lg:w-[420px] landscape:xl:desktop:w-[350px] h-full portrait:sm:h-auto landscape:min-h-[330px] px-4 portrait:sm:px-10 landscape:lg:px-10 landscape:xl:desktop:px-8 py-10 portrait:sm:py-16 landscape:lg:py-16 landscape:xl:desktop:py-12 space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16 landscape:xl:desktop:space-y-12 flex flex-col items-center rounded-2xl bg-background fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] textXl text-center z-[2]">
            {/*---content---*/}
            <div className="grow flex flex-col justify-center space-y-8">
              <div>Email the QR code (a PDF file) to yourself or a print shop</div>
              <div className="w-full  h-[56px] flex items-center relative">
                <input className="w-full settingsValueFont border text-start border-gray-300" defaultValue={paymentSettingsState.merchantEmail} />
                <div className="absolute w-[28px] h-[28px] bg-gray-200 flex items-center justify-center rounded-full right-2">
                  <div>&#10005;</div>
                </div>
              </div>
            </div>
            {/*---button---*/}
            <div className="w-full space-y-4">
              <button onClick={emailQrCode} className="buttonPrimary">
                Send Email
              </button>
              <button onClick={() => setEmailModal(false)} className="buttonSecondary">
                Cancel
              </button>
            </div>
          </div>
          <div className="modalBlackout z-[1]" onClick={() => setEmailModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default qrCodeModal;
