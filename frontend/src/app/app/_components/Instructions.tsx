import { useState } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faFileInvoiceDollar, faList } from "@fortawesome/free-solid-svg-icons";
import { countryData, CEXdata, activeCountries, merchantType2data, list2string, fees } from "@/utils/constants";

const Instructions = ({
  paymentSettingsState,
  cashoutSettingsState,
  setFigmaModal,
  downloadPlacardPdf,
  downloadQrSvg,
  downloadQrPng,
  downloadPlacardFigma,
  setRefundModal,
  setExchangeModal,
}: {
  paymentSettingsState: any;
  cashoutSettingsState: any;
  setFigmaModal: any;
  downloadPlacardPdf: any;
  downloadQrSvg: any;
  downloadQrPng: any;
  downloadPlacardFigma: any;
  setRefundModal: any;
  setExchangeModal: any;
}) => {
  const [expandOne, setExpandOne] = useState(false);
  const [expandTwo, setExpandTwo] = useState(false);
  const [expandThree, setExpandThree] = useState(false);

  return (
    <div className="xs:ml-[28px] sm:ml-[41px] lg:w-[688px] text-gray-800">
      <div className="w-full text-center xs:text-start text-2xl xs:text-2xl font-bold">Instructions</div>
      {/*---Instructions, Step 1: Set up---*/}
      <div
        className="flex mt-3 mb-1"
        onClick={() => {
          setExpandOne(!expandOne);
          setExpandTwo(false);
          setExpandThree(false);
        }}
      >
        <div className=" text-xl xs:text-lg font-bold">1. Set up</div>
        <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
          <div className={`${expandOne ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
          <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
        </div>
      </div>
      <div className={`${expandOne ? "max-h-[700px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
        <div className="appInstructionsBody">
          {paymentSettingsState.merchantPaymentType === "inperson" ? (
            <div className="flex flex-col relative">
              <div className="flex">
                <div className="mr-1">1.</div>
                <div>
                  Fill out the <span className="font-bold">Payment Settings</span> below
                </div>
              </div>
              <div className="mt-4 flex">
                <div className="mr-1">2.</div>
                <div>
                  <span className="link" onClick={downloadPlacardPdf}>
                    Download your QR code
                  </span>
                </div>
              </div>
              <div className="mt-4 flex">
                <div className="mr-1">3.</div>
                <div>
                  Print out and display your QR code
                  <div className="ml-2">&bull; we recommend using a print shop</div>
                  <div className="ml-2">
                    &bull; a print size of A6 (4x6") will fit{" "}
                    <a href="https://www.amazon.com/s?k=4x6+sign+holders" target="_blank" className="link">
                      these sign holders
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                (optional) Design your own placard (
                <span className="link" onClick={() => setFigmaModal(true)}>
                  instructions
                </span>
                )
                {/* . Then, download{" "}
              <span className="link" onClick={downloadPlacardFigma}>
                this Figma file
              </span>{" "}
              and the naked QR code either in{" "}
              <span className="link" onClick={downloadQrSvg}>
                SVG
              </span>{" "}
              (recommended) or{" "}
              <span className="link" onClick={downloadQrPng}>
                PNG
              </span>{" "}
              format. */}
              </div>
              <div className="relative">
                (optional) Create an Employee Password below (
                <span className="group">
                  <span className="link">why use an Employee Password?</span>
                  <div className="invisible group-hover:visible absolute w-[300px] top-[-171px] xs:top-[-140px] sm:top-[-90px] sm:w-[500px] p-4 border rounded-md bg-gray-100">
                    When an employee signs into the Flash Pay App with <span className="font-bold">Your Email</span> and the <span className="font-bold">Employee Password</span>,
                    they can view the{" "}
                    <span className="text-blue-700 font-bold">
                      <FontAwesomeIcon icon={faList} className="pr-0.5" />
                      Payments
                    </span>{" "}
                    menu tab to confirm customer payments. They can also mark payments as "To Be Refunded".
                  </div>
                </span>
                )
              </div>
            </div>
          ) : (
            <div>
              <div>
                Fill out the <span className="font-bold">Payment Settings</span> below. Then, copy your Payment Link (located below the QR Code placard) and use it in an &lt;a&gt;
                tag in your HTML code to create a "Flash Pay" payment button. Or, put the link on your social media profile (use URL shorteners to shorten it).
              </div>
              <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                (Optional){" "}
                <span onClick={downloadPlacardPdf} className="link">
                  Download the QR Code placard
                </span>{" "}
                (or naked QR code in{" "}
                <span className="link" onClick={downloadQrSvg}>
                  SVG
                </span>{" "}
                or{" "}
                <span className="link" onClick={downloadQrPng}>
                  PNG
                </span>{" "}
                format) and put it on any appropriate online medium
              </div>
              <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                (Optional) To edit your placard's size or design, read{" "}
                <span className="link" onClick={() => setFigmaModal(true)}>
                  these instructions
                </span>{" "}
                and download{" "}
                <span className="link" onClick={downloadPlacardFigma}>
                  this Figma file
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/*---Instructions, Step 2: Download your QR code---*/}
      <div
        className="flex mt-3 mb-1"
        onClick={() => {
          setExpandTwo(!expandTwo);
          setExpandOne(false);
          setExpandThree(false);
        }}
      >
        <div className="text-xl xs:text-lg font-bold">2. Confirm payment</div>
        <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
          <div className={`${expandTwo ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
          <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
        </div>
      </div>
      <div className={`${expandTwo ? "max-h-[820px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
        <div className="appInstructionsBody">
          {paymentSettingsState.merchantPaymentType === "inperson" ? (
            <div className="">
              <div className="font-bold">How does the customer pay?</div>
              <div>
                The customer pays by opening their Flash App, scanning your QR Code, and entering the amount of {paymentSettingsState.merchantCurrency} for payment.
                {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens with the same value will be sent from the customer to your Flash Pay account.`}
              </div>
              <div className="mt-4 font-bold">How do I confirm payment?</div>
              <div className="mt-1 relative">
                If the customer's payment is successful, your Flash App will receive a push notification. In addition, the payment will show in{" "}
                <span className="text-blue-700 whitespace-nowrap font-bold">
                  <FontAwesomeIcon icon={faList} className="pr-0.5" />
                  Payments
                </span>{" "}
                within several seconds.{" "}
                <span className="group">
                  <span className="link">What if the cashier does not have access to an electronic device?</span>
                  <div className="invisible group-hover:visible absolute left-0 bottom-[calc(100%-17px)] w-full px-3 py-2 font-normal bg-gray-100 border border-slate-600 text-slate-700 rounded-lg pointer-events-none z-[1]">
                    If you check the customer's phone, it should show an animated "Payment Completed" page. For a preview, click "Send" in the phone interface below.
                  </div>
                </span>
              </div>
              <div className="mt-4 font-bold">How should I log the payment?</div>
              <div>
                Payment history can be downloaded in{" "}
                <span className="text-blue-700 font-bold whitespace-nowrap">
                  <FontAwesomeIcon icon={faList} className="px-0.5" />
                  Payments
                </span>
                . But, we recommend you log the payment as a cash payment in your PoS device to maintain a single system for all payments.
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold">How does the customer pay?</div>
              <div>
                The customer pays by opening their Flash App, scanning your QR Code, and entering the amount of {paymentSettingsState.merchantCurrency} for payment.
                {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens with the same value will be sent to your Flash Pay account.`}
              </div>
              <div className="mt-1">You can confirm the payment in two ways:</div>
              <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                <span className="font-bold">Check your email.</span> If payment has been successfully sent to you, you will receive an email. The email will contain all information
                about the purchase.
              </div>
              <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                <span className="font-bold">Check the Flash Pay App.</span> Payment should appear in the{" "}
                <span className="text-blue-700 font-bold whitespace-nowrap">
                  <FontAwesomeIcon icon={faList} className="pr-0.5" />
                  Payments
                </span>{" "}
                menu tab after ~5s (a page refresh may be needed)
              </div>
            </div>
          )}
          <div className="mt-4 font-bold text-gray-600">How do I refund a customer's payment?</div>
          <div className="relative">
            You (or an employee) can mark a payment in{" "}
            <span className="text-blue-700 font-bold whitespace-nowrap">
              <FontAwesomeIcon icon={faList} className="px-0.5" />
              Payments
            </span>{" "}
            as "To Be Refunded". At the end of the day, open your Flash Pay App &gt; go to{" "}
            <span className="text-blue-700 font-bold whitespace-nowrap">
              <FontAwesomeIcon icon={faList} className="px-0.5" />
              Payments
            </span>{" "}
            &gt; click "Refund all payments marked as To Be Refunded". Or, you can click the individual payments and refund each payment one-by-one.{" "}
            <span className="link" onClick={() => setRefundModal(true)}>
              More about refunds
            </span>
          </div>
        </div>
      </div>
      {/*--- Instructions, 3. Cash Out ---*/}
      <div className="mt-3 mb-1 text-xl xs:text-lg font-bold">
        3. Cash out{" "}
        <span
          className="link font-normal whitespace-nowrap"
          onClick={() => {
            setExpandThree(!expandThree);
            setExpandTwo(false);
            setExpandOne(false);
          }}
        >
          {expandThree ? "hide" : "show"} <FontAwesomeIcon icon={expandThree ? faAngleUp : faAngleDown} className="align-middle" />
        </span>
      </div>
      <div className={`${expandThree ? "max-h-[500px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
        <div className="appInstructionsBody space-y-4">
          {/*--- cash out step 1 ---*/}
          <div className="flex">
            <div className="mr-1">1.</div>
            <div>
              Sign up for an account on {cashoutSettingsState.cex} (
              <span className="link" onClick={() => setExchangeModal(true)}>
                instructions
              </span>
              )
            </div>
          </div>
          {/*--- cash out step 2 ---*/}
          <div className="flex">
            <div className="mr-1">2.</div>
            <div>
              {/*--- not Coinbase Exchange ---*/}
              {cashoutSettingsState.cex != "Coinbase Exchange" && (
                <div>In your {cashoutSettingsState.cex}, copy your USDC deposit address on the Polygon network (instructions) and paste it in the Cash Out Settings below</div>
              )}
              {/*--- Coinbase Exchange ---*/}
              {cashoutSettingsState.cex == "Coinbase Exchange" && (
                <div>
                  In Cash Out, click "Withdraw" and a window should prompt you to sign into Coinbase. After signing in, enter the amount to withdraw and click "Submit Withdrawal".
                  The USDC tokens in your Flash Pay account will be converted to {paymentSettingsState.merchantCurrency} at{" "}
                  {paymentSettingsState.merchantCurrency == "USD" ? "a 1:1 rate (no fees)" : "the best possible exchange rate on Coinbase (including 0.01% fees)"}, and then
                  deposited into your bank within 24-48 hours ({fees[cashoutSettingsState.cex][paymentSettingsState.merchantCountry]} fee).
                </div>
              )}
            </div>
          </div>
          {/*--- cash out step 3 ---*/}
          {cashoutSettingsState.cex != "Coinbase Exchange" && (
            <div className="flex">
              <div className="mr-1">3.</div>
              <div>
                {cashoutSettingsState.cex != "Coinbase Exchange" && (
                  <div className="">
                    To cash out, go to the{" "}
                    <span className="text-blue-700 font-bold whitespace-nowrap">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="pr-0.5" />
                      Cash Out
                    </span>{" "}
                    menu tab and click the <span className="bg-blue-700 text-white font-bold text-xs px-1.5 py-0.5 xs:py-0 rounded-full whitespace-nowrap">Cash Out</span> button.
                    This will send all USDC from your Flash App to your {cashoutSettingsState.cex}. Then, in your exchange, convert USDC to {paymentSettingsState.merchantCurrency},
                    and withdraw the money to your bank.
                  </div>
                )}
                {cashoutSettingsState.cex == "Coinbase Exchange" && (
                  <div className="">
                    Fill in the "Cash Out Settings" below. When you are ready to cash out, go to the{" "}
                    <span className="text-blue-700 font-bold whitespace-nowrap">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="pr-0.5" />
                      Cash Out
                    </span>{" "}
                    menu tab and click the <span className="bg-blue-700 text-white font-bold text-xs px-1.5 py-0.5 xs:py-0 rounded-full whitespace-nowrap">Cash Out</span> button.
                    Deposits should arrive in your bank after 1-2 days.
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="relative">
            <span className="group">
              <span className="link">Will I lose money from fluctuating exchange rates?</span>
              {/*---tooltip---*/}
              <div className="invisible group-hover:visible absolute bottom-[calc(100%+6px)] px-3 py-2 pointer-events-none text-gray-700 bg-gray-100 border-gray-500 border rounded-lg z-10">
                During payment, our interface adds 0.3~0.5% to the stablecoin-to-fiat exchange rate in favor of the business. Therefore, on average, you should not lose money from
                fluctuating rates if you convert frequently (e.g., once a week).
              </div>
            </span>
          </div>
        </div>
      </div>
      {/* <div className="mt-3 text-center xs:text-start text-lg font-bold link">Help Me Get Started</div> */}
    </div>
  );
};

export default Instructions;
