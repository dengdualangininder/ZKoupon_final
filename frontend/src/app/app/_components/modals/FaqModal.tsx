import { useState } from "react";
import Image from "next/image";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faList, faXmark } from "@fortawesome/free-solid-svg-icons";

const Instructions = ({ paymentSettingsState, cashoutSettingsState, setFaqModal }: { paymentSettingsState: any; cashoutSettingsState: any; setFaqModal: any }) => {
  const [expand, setExpand] = useState("");

  return (
    <div>
      <div className="w-[90%] max-w-[600px] h-[92%] pb-8 flex flex-col items-center rounded-xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-gray-400 z-[90]">
        {/*---close button---*/}
        <div onClick={() => setFaqModal(false)} className="absolute top-1 right-1 font-bold px-4 py-3 text-4xl active:bg-gray-200 rounded-lg">
          &#10005;
        </div>

        {/*--- title ---*/}
        <div className="py-5 w-full text-center text2xl font-bold">FAQs</div>

        {/*--- body ---*/}
        <div className="px-4 overflow-y-auto">
          <div className="flex flex-col">
            {/*--- How do I set up? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "setup" ? setExpand("") : setExpand("setup");
                }}
              >
                <div className="faqQuestionFont">How do I start?</div>
                <div className="relative ml-2 w-[22px] h-[22px] flex items-center justify-center">
                  <div className={`${expand == "setup" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "setup" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                {paymentSettingsState.merchantPaymentType === "inperson" && (
                  <div className="">
                    All you have to do is print out and display your QR code so that customers can scan it. In the <span className="font-bold">Cash Out</span> menu, you can
                    download your QR code or email it to a print shop. We recommend a print size of A6 (4x6"), which will fit{" "}
                    <a href="https://www.amazon.com/s?k=4x6+sign+holders" target="_blank" className="link">
                      these sign holders
                    </a>
                    .
                  </div>
                )}
                {paymentSettingsState.merchantPaymentType === "online" && (
                  <div className="flex flex-col space-y-2">
                    <div>
                      Copy your Payment Link in the <span className="font-bold">Cash Out</span> menu and use it in an &lt;a&gt; tag in your HTML code to create a "Pay With
                      MetaMask" button in your checkout page. When a user clicks the button, they will be be able to make payments with MetaMask on desktop or mobile.
                    </div>
                    <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                      (Optional) <span className="link">Download the QR Code placard</span> (or naked QR code in <span className="link">SVG</span> or{" "}
                      <span className="link">PNG</span> format) and put it on any appropriate online medium
                    </div>
                    <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                      (Optional) To edit your placard's size or design, read <span className="link">these instructions</span> and download{" "}
                      <span className="link">this Figma file</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/*--- What is the Employee Password? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "employeePass" ? setExpand("") : setExpand("employeePass");
                }}
              >
                <div className="faqQuestionFont">What is the Employee Password?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "employeePass" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "employeePass" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                You can create an Employee Password in Settings. When an employee logins with your Account Email and your Employee Password, they can view the{" "}
                <span className="font-bold">Payments</span> menu. This allows them to confirm payment and mark payments as "To Be Refunded". Employees do not have access to other
                functions.
              </div>
            </div>

            {/*--- How does a customer pay? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "pay" ? setExpand("") : setExpand("pay");
                }}
              >
                <div className="faqQuestionFont">How does a customer pay?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "pay" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "pay" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase space-y-2 relative`}>
                <div className="">
                  Before payment, the customer must have the{" "}
                  <span className="group">
                    <span className="link">MetaMask App</span>
                    <div className="w-full bottom-0 tooltip">
                      MetaMask is used by &gt; 50 million people worldwide. It is the most popular App used by crypto users to send and receive tokens.
                    </div>
                  </span>{" "}
                  and USDC tokens on the Polygon network. To pay, the customer will scan your QR code with their camera and enter the amount of{" "}
                  {paymentSettingsState.merchantCurrency} for payment.
                </div>
                <div>USDC tokens equal in value to the payment amount will be sent from the customer to your Flash account (no fees).</div>
              </div>
            </div>

            {/*--- How do I confirm payment? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "confirm" ? setExpand("") : setExpand("confirm");
                }}
              >
                <div className="faqQuestionFont">How do I confirm payment?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "confirm" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "confirm" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                Upon a successful payment, you will receive a notification banner in your Flash App. The payment will then appear in the <span className="font-bold">Payments</span>{" "}
                menu.
              </div>
            </div>

            {/*--- How should I log a payment? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "log" ? setExpand("") : setExpand("log");
                }}
              >
                <div className="faqQuestionFont">How should I log a payment?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "log" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "log" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                If you have PoS device, log the payment on it as you would a cash payment, so you can maintain a single system. If you don't have a PoS system, don't worry about
                logging payments, as all payment details are saved and can be downloaded in the <span className="font-bold">Cash Out</span> menu.
              </div>
            </div>

            {/* <div className="mt-1">You can confirm the payment in two ways:</div>
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
            </div> */}

            {/*--- How do I make refunds? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "refund" ? setExpand("") : setExpand("refund");
                }}
              >
                <div className="faqQuestionFont">How do I make refunds?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "refund" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "refund" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase space-y-2`}>
                <p>Owners can refund payments by clicking on a transaction, and clicking "Refund".</p>
                <p>Due to seurity, employees are restricted from transferring funds. Therefore, they cannot make refunds.</p>
                <p className="">
                  Instead, employees can mark a payment as "To Be Refunded". Then, at any time, you (the owner) can go to the <span className="font-bold">Payments</span> menu and
                  click "Refund All Payments Marked As 'To Be Refunded'" to execute all refunds in a single click.
                </p>
              </div>
            </div>

            {/*--- How do I cash out? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "cashout" ? setExpand("") : setExpand("cashout");
                }}
              >
                <div className="faqQuestionFont">How do I cash out?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "cashout" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "cashout" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                {paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase" ? (
                  <div className="space-y-2">
                    <div className="flex">
                      <div className="mr-1">1.</div>
                      <div>Sign up for a Coinbase account</div>
                    </div>
                    <div className="flex">
                      <div className="mr-1">2.</div>
                      <div>
                        In the <span className="font-bold">Cash Out</span>menu, click "Link your Coinbase account"
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-1">3.</div>
                      <div>Click the "Transfer to Coinbase" button and make a transfer</div>
                    </div>
                    <div className="flex">
                      <div className="mr-1">4.</div>
                      <div>
                        After 1-5 minutes, when your Coinbase balance reflects the new balance, click the "Transfer to Bank" button and make a transfer. USDC will be converted to{" "}
                        {paymentSettingsState.merchantCurrency}, and the money transferred to your bank within 1-2 days.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex">
                        <div className="mr-1">1.</div>
                        <div>Log into your {cashoutSettingsState.cex == "Other CEX" ? "CEX" : cashoutSettingsState.cex} account and find the USDC (Polygon) deposit address</div>
                      </div>
                      <div className="flex">
                        <div className="mr-1">2.</div>
                        <div>Paste this address into the "CEX EVM Address" field in Settings</div>
                      </div>
                      <div className="flex">
                        <div className="mr-1">3.</div>
                        <div>
                          In the <span className="font-bold">Cash Out</span> menu, click the "Transfer to{" "}
                          {cashoutSettingsState.cex == "Other CEX" ? "CEX" : cashoutSettingsState.cex}" button and make a transfer
                        </div>
                      </div>
                      <div className="flex">
                        <div className="mr-1">4.</div>
                        <div>
                          Log into your {cashoutSettingsState.cex == "Other CEX" ? "CEX" : cashoutSettingsState.cex} account, convert USDC to the local currency, and withdraw the
                          money to your bank.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/*--- What are the fees? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "fees" ? setExpand("") : setExpand("fees");
                }}
              >
                <div className="faqQuestionFont">What are the fees?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "fees" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "fees" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                Flash charges no fees per transaction. When transferring funds from Flash to your {cashoutSettingsState.cex == "Other CEX" ? "CEX" : cashoutSettingsState.cex}{" "}
                account, it will cost ~0.10 USDC. When transferring funds from your {cashoutSettingsState.cex == "Other CEX" ? "CEX" : cashoutSettingsState.cex} account to your
                bank,{" "}
                {paymentSettingsState.merchantCountry != "Any country" && cashoutSettingsState.cex == "Coinbase"
                  ? "there are no fees."
                  : "the transfer may be free or have a fee. Please check your CEX's website."}
              </div>
            </div>

            {/*--- Will I lose money from flucuating rates? ---*/}
            <div className={`${paymentSettingsState.merchantCurrency == "USD" ? "hidden" : ""} faqContainer`}>
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "lose" ? setExpand("") : setExpand("lose");
                }}
              >
                <div className="faqQuestionFont">Will I lose from fluctuating rates?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "lose" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "lose" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                On average, you will not lose money from fluctuating USDC to {paymentSettingsState.merchantCurrency} rates (in fact, you might earn a little). During payment, our
                interface alters the USDC to fiat rate by 0.3% in favor of the business. This additional 0.3% that businesses earn is sufficient to buffer against losses due to
                fluctuating rates.
              </div>
            </div>

            {/*--- What is the USDC to fiat rate? ---*/}
            <div className="faqContainer">
              {/*--- question ---*/}
              <div
                className="flex items-center"
                onClick={() => {
                  expand == "rate" ? setExpand("") : setExpand("rate");
                }}
              >
                <div className="faqQuestionFont">What is the USDC to {paymentSettingsState.merchantCurrency} rate?</div>
                <div className="relative ml-2 w-[20px] h-[20px]">
                  <div className={`${expand == "rate" ? "rotate-[90deg]" : ""} faqLine1`}></div>
                  <div className="faqLine2"></div>
                </div>
              </div>
              {/*--- answer ---*/}
              <div className={`${expand == "rate" ? "max-h-[500px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms] textBase`}>
                {paymentSettingsState.merchantCurrency == "USD"
                  ? "USDC is converted to USD at a 1:1 rate with no fees."
                  : `USDC is converted to ${paymentSettingsState.merchantCurrency} on ${
                      cashoutSettingsState.cex == "Other CEX" ? "your CEX" : cashoutSettingsState.cex
                    }, which usually offers a better rate than the USD to ${paymentSettingsState.merchantCurrency} rate at any bank.`}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default Instructions;
