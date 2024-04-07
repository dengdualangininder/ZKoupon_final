"use client";
// next
import { useState, useEffect } from "react";
import Image from "next/image";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
// qr code
import { QRCodeSVG } from "qrcode.react";
import { pdf, Document, Page, Path, Svg, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Buffer } from "buffer";
// component
import Placard from "../placard/Placard";

const qrModal = ({
  paymentSettingsState,
  cashoutSettingsState,
  setQrModal,
  url,
  setFigmaModal,
}: {
  paymentSettingsState: any;
  cashoutSettingsState: any;
  setQrModal: any;
  url: string;
  setFigmaModal: any;
}) => {
  const [qrWidth, setQrWidth] = useState(0);
  const [showSend, setShowSend] = useState(false);

  useEffect(() => {
    const qrWidthTemp =
      document.getElementById("modalQrContainer")?.offsetWidth! * 1.4142 > document.getElementById("modalQrContainer")?.offsetHeight!
        ? (document.getElementById("modalQrContainer")?.offsetHeight! * 210) / (1.4142 * 424.26)
        : (document.getElementById("modalQrContainer")?.offsetWidth! * 210) / 424.26;

    console.log(qrWidthTemp);
    setQrWidth(qrWidthTemp);
  }, []);

  const downloadPlacardPdf = async () => {
    const el = document.getElementById("qrPlacard");
    const blob = await pdf(
      <Document>
        <Page size="A5" style={{ position: "relative" }}>
          <View>
            <Placard />
          </View>
          <View style={{ position: "absolute", transform: "translate(105, 186)" }}>
            {/* @ts-ignore */}
            <Svg width="215" height="215" viewBox={el?.attributes.viewBox.value} fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* @ts-ignore */}
              <Path fill="#ffffff" d={el?.children[0].attributes.d.value} shape-rendering="crispEdges"></Path>
              {/* @ts-ignore */}
              <Path fill="#000000" d={el?.children[1].attributes.d.value} shape-rendering="crispEdges"></Path>
            </Svg>
          </View>
        </Page>
      </Document>
    ).toBlob();
    saveAs(blob, "MyPlacard");
  };

  const getSize = () => {
    if (document.getElementById("modalQrContainer")?.offsetWidth! * 1.4142 > document.getElementById("modalQrContainer")?.offsetHeight!) {
      var width = document.getElementById("modalQrContainer")?.offsetHeight! / 1.4142;
    } else {
      var width = document.getElementById("modalQrContainer")?.offsetWidth!;
    }
    return width;
  };

  const sendEmail = async () => {
    //logic here
  };

  return (
    <div>
      <div className="w-[90%] h-[88%] px-8 py-6 flex portrait:flex-col items-center rounded-3xl border border-gray-400 bg-white fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-53%] z-[90]">
        {/*---Qr Code---*/}
        <div id="modalQrContainer" className="w-full landscape:h-[100%] portrait:h-[50%] flex-none relative bg-red--300">
          <Image src="/placard.svg" alt="placard" fill className="" />
          <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[30]">
            <QRCodeSVG xmlns="http://www.w3.org/2000/svg" size={qrWidth} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
          </div>
          <div className="hidden">
            <QRCodeSVG id="qrPlacard" xmlns="http://www.w3.org/2000/svg" size={220} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
          </div>
        </div>

        {/*---action buttons---*/}
        <div className="w-full portrait:h-[50%] pt-6 pb-12 flex flex-col items-center justify-evenly">
          <div>
            Email this QR Code to a professional print shop. Then display it to your customers. A print size of A6 (4"x6") can fit <span className="link">these sign holders</span>.
          </div>
          <button
            className={`${showSend ? "hidden" : ""} w-[50%] min-w-[300px] py-3 rounded-full border border-gray-400 text-gray-400 font-medium`}
            onClick={() => setShowSend(true)}
          >
            Email QR Code
          </button>
          <div className={`${showSend ? "" : "hidden"} flex w-[50%] min-w-[300px] h-[48px] rounded-full border border-gray-400 text-gray-400 font-medium`}>
            <div className="px-3 w-full h-full flex flex-none items-center">
              <input className="w-full text-center text-gray-800 py-2 outline-none tracking-tight" placeholder="Enter email address"></input>
              <button className="ml-2 font-bold text-blue-500 active:text-blue-400" onClick={sendEmail}>
                Send
              </button>
            </div>
          </div>
          <button className="w-[50%] min-w-[300px] text-base py-3 rounded-full border border-gray-400 text-gray-400 font-medium" onClick={downloadPlacardPdf}>
            Download QR Code
          </button>

          <button
            className="w-[50%] min-w-[300px] py-3 rounded-full border border-gray-400 text-gray-400 font-medium"
            onClick={() => {
              setQrModal(false);
              setFigmaModal(true);
            }}
          >
            Customize QR Code
          </button>
        </div>
        {/*---close button---*/}
        <button
          onClick={() => setQrModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default qrModal;
