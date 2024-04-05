"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

const PWA = ({ isMobile, setPage, paymentSettingsState, cashoutSettingsState }: { isMobile: boolean; setPage: any; paymentSettingsState: any; cashoutSettingsState: any }) => {
  const suggestedCex = "Coinbase";

  const [step, setStep] = useState("1");

  const merchantEmail = "dfds";

  return (
    <div className="w-full h-screen text-gray-700 flex justify-center items-center">
      <div className="w-[90%] h-[90%] max-w-[600px] xs:max-h-[600px] flex flex-col items-center">
        {step == "1" && (
          <div>
            <div className="text-4xl font-bold">Welcome to Flash</div>
            <div className="mt-4 text-xl text-center">We offer instant global payments with 0% fees for all businesses.</div>
            <div className="mt-4 text-2xl font-bold">How It Works</div>
            <div className="mt-4 text-xl">You display a QR code at the cash register or on your website.</div>
            <div className="w-full flex justify-end">
              <button className="introNext" onClick={() => setStep("2")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "2" && (
          <div>
            <div className="mt-4 text-xl">The customer scans the QR code with their mobile camera. Then, they can use any Web3 wallet (such as MetaMask) to pay you.</div>
            <div className="w-full flex justify-between">
              <button className="introBack" onClick={() => setStep("1")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("3")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "3" && (
          <div>
            <div className="mt-4 text-xl">
              To cash out, you must first sign up for a cryptocurrency exchange and then link it to your Flash App. You can then transfer money from your Flash App to your
              cryptocurrency exchange, and then to your bank in a single click.
            </div>
            <div className="w-full flex justify-between">
              <button className="introBack" onClick={() => setStep("2")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("businessName")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "businessName" && (
          <div>
            <div className="mt-4 text-xl">Now, let's generate your QR code.</div>
            <div className="mt-4 text-xl">First, enter the name of your business</div>

            <div className="w-full flex justify-between">
              <button className="introBack" onClick={() => setStep("3")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("countryCurrency")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "countryCurrency" && (
          <div>
            <div className="mt-4 text-xl">We auto-detected your country and payment currency. Is this correct?</div>
            <div className="w-full flex justify-between">
              <button className="introBack" onClick={() => setStep("businessName")}>
                Back
              </button>
              <button className="introNext" onClick={() => setStep("inpersonQr")}>
                Next
              </button>
            </div>
          </div>
        )}
        {step == "inpersonQr" && (
          <div>
            <div className="mt-4 text-xl">QR code generated! We will now send the QR code to {merchantEmail}, which you can foward to a print shop for printing.</div>
            <div className="w-full flex justify-between">
              <button className="introBack" onClick={() => setStep("countryCurrency")}>
                Back
              </button>
              <button className="introNext">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWA;
