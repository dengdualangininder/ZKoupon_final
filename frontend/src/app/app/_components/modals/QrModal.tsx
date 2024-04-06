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

const qrModal = ({ paymentSettingsState, cashoutSettingsState, setQrModal, url }: { paymentSettingsState: any; cashoutSettingsState: any; setQrModal: any; url: string }) => {
  const [qrWidth, setQrWidth] = useState(0);

  useEffect(() => {
    const qrWidthTemp =
      document.getElementById("modalQrContainer")?.offsetWidth! * 1.4142 > document.getElementById("modalQrContainer")?.offsetHeight!
        ? (document.getElementById("modalQrContainer")?.offsetHeight! * 210) / (1.4142 * 424.26)
        : (document.getElementById("modalQrContainer")?.offsetWidth! * 210) / 424.26;

    console.log(qrWidthTemp);
    setQrWidth(qrWidthTemp);
  }, []);

  const downloadQrPng = () => {
    const el = document.getElementById("qrpng") as HTMLCanvasElement;
    const qrPngUrl = el?.toDataURL(); // returns raw bytes in base64 format
    let downloadLink = document.createElement("a");
    downloadLink.href = qrPngUrl;
    downloadLink.download = "QRCode.png";
    downloadLink.click();
  };

  const downloadQrSvg = () => {
    const el = document.getElementById("qrsvg") as HTMLCanvasElement;
    const svgXML = new XMLSerializer().serializeToString(el);
    const qrSvgUrl = "data:image/svg," + encodeURIComponent(svgXML);
    let downloadLink = document.createElement("a");
    downloadLink.href = qrSvgUrl;
    downloadLink.download = "QRCode.svg";
    downloadLink.click();
  };

  const downloadPlacardPdf = async () => {
    const PlacardComponent = CEXdata[cashoutSettingsState.CEX].placard.component;
    const el = document.getElementById("qrsvg");
    const blob = await pdf(
      <Document>
        <Page size="A5" style={{ position: "relative" }}>
          <View>
            <PlacardComponent />
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

  const downloadPlacardFigma = () => {
    let downloadLink = document.createElement("a");
    downloadLink.href = CEXdata[cashoutSettingsState.CEX].placard.fig;
    downloadLink.download = "template.fig";
    downloadLink.click();
  };

  const getSize = () => {
    if (document.getElementById("modalQrContainer")?.offsetWidth! * 1.4142 > document.getElementById("modalQrContainer")?.offsetHeight!) {
      var width = document.getElementById("modalQrContainer")?.offsetHeight! / 1.4142;
    } else {
      var width = document.getElementById("modalQrContainer")?.offsetWidth!;
    }
    return width;
  };

  return (
    <div>
      <div className="w-[90%] h-[88%] px-8 py-6 flex portrait:flex-col items-center rounded-3xl border border-gray-400 bg-white fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-53%] z-[90]">
        {/*---Qr Code---*/}
        <div id="modalQrContainer" className="w-full landscape:h-[100%] portrait:h-[60%] relative bg-red-300">
          <Image src="/placard.svg" alt="placard" fill className="" />
          <div className="absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[30]">
            <QRCodeSVG id="qrsvg" xmlns="http://www.w3.org/2000/svg" size={qrWidth} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} value={paymentSettingsState.qrCodeUrl} />
          </div>
        </div>

        {/*---action buttons---*/}
        <div className="grow mt-4 flex flex-col items-center space-y-4">
          <button className="w-[250px] py-3 rounded-full border border-gray-400 text-gray-400 font-medium">Download QR Code</button>
          <button className="w-[250px] py-3 rounded-full border border-gray-400 text-gray-400 font-medium">Send QR Code to Email</button>
          <button className="w-[250px] py-3 rounded-full border border-gray-400 text-gray-400 font-medium">Customize Your QR Code</button>
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
