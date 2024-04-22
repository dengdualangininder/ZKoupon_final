import { useState } from "react";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faList, faXmark } from "@fortawesome/free-solid-svg-icons";

const Instructions = ({ paymentSettingsState, cashoutSettingsState, setFaqModal }: { paymentSettingsState: any; cashoutSettingsState: any; setFaqModal: any }) => {
  const [expand, setExpand] = useState("");

  return (
    <div>
      <div className="w-[90%] h-[90%] pb-8 flex flex-col items-center rounded-xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white border border-gray-400 z-[90]">
        {/*---close button---*/}
        <div onClick={() => setFaqModal(false)} className="absolute top-0 right-1 px-4 py-3 text-4xl active:bg-gray-200 rounded-lg">
          &#10005;
        </div>
        {/* <button
          onClick={() => setFaqModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button> */}

        {/*--- title ---*/}
        <div className="py-4 w-full text-center text-2xl font-bold">Instructions</div>

        {/*--- body ---*/}
        <div className="px-4 flex flex-col overflow-y-auto">
          <div className="pt-4 flex flex-col space-y-6">
            {/*--- Step 1: Set up ---*/}
            <div className="">
              {/*--- header ---*/}
              <div className="flex">
                <div
                  className="flex mb-1"
                  onClick={() => {
                    expand == "1" ? setExpand("") : setExpand("1");
                  }}
                >
                  <div className=" text-xl xs:text-lg font-bold">Set up</div>
                  <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
                    <div className={`${expand == "1" ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
                    <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
                  </div>
                </div>
              </div>
              {/*--- body ---*/}
              <div className={`${expand == "1" ? "max-h-[700px]" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
                <div className="appInstructionsBody">
                  {paymentSettingsState.merchantPaymentType === "inperson" ? (
                    <div className="flex flex-col relative">
                      <div className="flex">
                        <div className="mr-2">1.</div>
                        <div>
                          Fill out your <span className="font-bold">Payment Settings</span> in Settings
                        </div>
                      </div>
                      <div className="mt-4 flex">
                        <div className="mr-2">2.</div>
                        <div>
                          Click <span className="font-bold">My QR Code</span> (in Settings) and send the QR code to a professional print shop
                        </div>
                      </div>
                      <div className="mt-4 flex">
                        <div className="mr-2">3.</div>
                        <div className="font-bold">
                          Display your QR code
                          <div className="ml-2 font-normal">
                            &bull; a print size of A6 (4x6") will fit{" "}
                            <a href="https://www.amazon.com/s?k=4x6+sign+holders" target="_blank" className="link">
                              these sign holders
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 italic">Optional</div>
                      <div className="flex">
                        <div className="mr-2">4.</div>
                        <div className="flex flex-col">
                          <div>
                            <span className="font-bold">Create an Employee Password under Account Settings</span> in Settings.
                          </div>
                          <div className="mt-1 group relative">
                            <span className="link">What is the purpose of an Employee Password?</span>
                            <div className="invisible group-hover:visible absolute bottom-[calc(100%)] left-0 w-full px-3 py-2 rounded-md border border-gray-500 bg-gray-100 z-1">
                              When employees login with your Account Email and the Employee Password, they have access to 2 functions: 1) viewing payments, so they can confirm a
                              payment, and 2) marking payments as "To Be Refunded". Employees do not have access to other functions.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>
                        Fill out the <span className="font-bold">Payment Settings</span> below. Then, copy your Payment Link (located below the QR Code placard) and use it in an
                        &lt;a&gt; tag in your HTML code to create a "Flash Pay" payment button. Or, put the link on your social media profile (use URL shorteners to shorten it).
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
            </div>

            {/*---Instructions, Step 2: Download your QR code---*/}
            <div>
              <div className="flex">
                <div
                  className="flex mb-1"
                  onClick={() => {
                    expand == "2" ? setExpand("") : setExpand("2");
                  }}
                >
                  <div className="text-xl xs:text-lg font-bold">How customers pay</div>
                  <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
                    <div className={`${expand == "2" ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
                    <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
                  </div>
                </div>
              </div>
              <div className={`${expand == "2" ? "max-h-[800px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
                <div className="appInstructionsBody">
                  {paymentSettingsState.merchantPaymentType === "inperson" ? (
                    <div className="">
                      <div className="font-bold">How do customers pay?</div>
                      <div className="mt-1 relative">
                        Customers need to have USDC tokens in a{" "}
                        <span className="group">
                          <span className="link">Web3 Wallet</span>
                          <div className="invisible group-hover:visible absolute bottom--0 left-0 w-[346px] px-3 py-2 rounded-md border border-gray-500 bg-gray-100 z-1">
                            A <span className="font-bold">Web3 Wallet</span> is an App that can hold USDC tokens. Currently, MetaMask is the most popular Web3 Wallet.
                          </div>
                        </span>{" "}
                        to pay. To pay, the customer scans your QR code with their camera, enters the amount of {paymentSettingsState.merchantCurrency} for payment, and clicks
                        "Send".
                        {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens equal to the payment value will be sent from the customer to your Flash account.`}
                      </div>
                      <div className="mt-4 font-bold">How do I confirm payment?</div>
                      <div className="mt-1 relative">
                        Several seconds after payment, you will receive a notification banner indicating a successful payment. The payment will then appear in{" "}
                        <span className="text-blue-700 whitespace-nowrap font-bold">
                          <FontAwesomeIcon icon={faList} className="pr-0.5" />
                          Payments
                        </span>
                        .
                      </div>
                      <div className="mt-4 font-bold">How should I log the payment?</div>
                      <div className="mt-1">
                        If you have PoS device, log the payment in your PoS device as you would a cash payment. If you don't, all payment details can be downloaded in{" "}
                        <span className="text-blue-700 font-bold whitespace-nowrap">
                          <FontAwesomeIcon icon={faList} className="px-0.5" />
                          Payments
                        </span>{" "}
                        for record keeping.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold">How does the customer pay?</div>
                      <div className="mt-1">
                        The customer pays by opening their Flash App, scanning your QR Code, and entering the amount of {paymentSettingsState.merchantCurrency} for payment.
                        {paymentSettingsState.merchantCurrency == "USD" ? "" : ` USDC tokens with the same value will be sent to your Flash Pay account.`}
                      </div>
                      <div className="mt-1">You can confirm the payment in two ways:</div>
                      <div className="mt-1 ml-3 text-base leading-tight xs:text-sm xs:leading-tight">
                        <span className="font-bold">Check your email.</span> If payment has been successfully sent to you, you will receive an email. The email will contain all
                        information about the purchase.
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
                </div>
              </div>
            </div>

            {/*--- Instructions, 3. Refunds ---*/}
            <div>
              <div className="flex">
                <div
                  className="flex mb-1"
                  onClick={() => {
                    expand == "3" ? setExpand("") : setExpand("3");
                  }}
                >
                  <div className="text-xl xs:text-lg font-bold">Refunds</div>
                  <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
                    <div className={`${expand == "3" ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
                    <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
                  </div>
                </div>
              </div>

              <div className={`${expand == "3" ? "max-h-[650px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
                <div className="appInstructionsBody">
                  {cashoutSettingsState.cex == "Coinbase Exchange" && (
                    <div className="space-y-4">
                      {/*--- cash out step 1 ---*/}
                      <p className="mt-1 relative">
                        You (or an employee) can mark a payment in{" "}
                        <span className="text-blue-700 font-bold whitespace-nowrap">
                          <FontAwesomeIcon icon={faList} className="px-0.5" />
                          Payments
                        </span>{" "}
                        as "To Be Refunded". At any time, you (the owner) can go to{" "}
                        <span className="text-blue-700 font-bold whitespace-nowrap">
                          <FontAwesomeIcon icon={faList} className="px-0.5" />
                          Payments
                        </span>{" "}
                        and click "Refund all payments marked as 'To Be Refunded'". Or, you can click the individual payments and refund each payment one by one.{" "}
                      </p>
                      <p>Due to seurity, employees are restricted from transferring funds. Therefore, they cannot make refunds.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/*--- Instructions, 4. Cash Out ---*/}
            <div>
              <div className="flex">
                <div
                  className="flex mb-1"
                  onClick={() => {
                    expand == "4" ? setExpand("") : setExpand("4");
                  }}
                >
                  <div className="text-xl xs:text-lg font-bold">Cash out</div>
                  <div className="relative mt-[5px] ml-2 w-[20px] h-[20px] rounded-full">
                    <div className={`${expand == "4" ? "rotate-[90deg]" : ""} absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600 transition-all duration-500`}></div>
                    <div className={`rotate-90 absolute left-[8.5px] bottom-[3px] w-[2px] h-[12px] bg-blue-600`}></div>
                  </div>
                </div>
              </div>

              <div className={`${expand == "4" ? "max-h-[650px] drop-shadow-lg" : "max-h-[0px]"} overflow-hidden transition-all duration-[500ms]`}>
                <div className="appInstructionsBody">
                  {cashoutSettingsState.cex == "Coinbase Exchange" && (
                    <div className="space-y-4">
                      {/*--- cash out step 1 ---*/}
                      <div className="flex">
                        <div className="mr-1">1.</div>
                        <div>
                          Sign up for a Coinbase account (
                          <span
                            className="link"
                            onClick={() => {
                              // setExchangeModal(true);
                            }}
                          >
                            instructions
                          </span>
                          )
                        </div>
                      </div>
                      {/*--- cash out step 2 ---*/}
                      <div className="flex">
                        <div className="mr-1">2.</div>
                        <div>In Cash Out, click "Link your Coinbase account"</div>
                      </div>
                      {/*--- cash out step 3 ---*/}
                      <div className="flex">
                        <div className="mr-1">3.</div>
                        <div>Click "Transfer to Coinbase"</div>
                      </div>
                      {/*--- cash out step 4 ---*/}
                      <div className="flex">
                        <div className="mr-1">4.</div>
                        <div>
                          After 1-5 minutes, when your Coinbase Balance reflects the new balance, click "Transfer to Bank". USDC will be converted to{" "}
                          {paymentSettingsState.merchantCurrency}, and the money transferred to your bank within 1-2 days.
                        </div>
                      </div>
                    </div>
                  )}
                  {cashoutSettingsState.cex != "Coinbase Exchange" && (
                    <div className="space-y-4">
                      {/*--- cash out step 1 ---*/}
                      <div className="flex">
                        <div className="mr-1">1.</div>
                        <div>
                          Sign up for an account on {cashoutSettingsState.cex} (
                          <span
                            className="link"
                            onClick={() => {
                              // setExchangeModal(true);
                            }}
                          >
                            instructions
                          </span>
                          )
                        </div>
                      </div>
                      {/*--- cash out step 2 ---*/}
                      <div className="flex">
                        <div className="mr-1">2.</div>
                        <div>
                          In your {cashoutSettingsState.cex}, copy your USDC deposit address on the Polygon network (instructions) and paste it in the Cash Out Settings below
                        </div>
                      </div>
                      {/*--- cash out step 3 ---*/}
                      <div className="flex">
                        <div className="mr-1">3.</div>
                        <div>
                          To cash out, go to the{" "}
                          <span className="text-blue-700 font-bold whitespace-nowrap">
                            <FontAwesomeIcon icon={faFileInvoiceDollar} className="pr-0.5" />
                            Cash Out
                          </span>{" "}
                          menu tab and click the <span className="bg-blue-700 text-white font-bold text-xs px-1.5 py-0.5 xs:py-0 rounded-full whitespace-nowrap">
                            Cash Out
                          </span>{" "}
                          button. This will send all USDC from your Flash App to your {cashoutSettingsState.cex}. Then, in your exchange, convert USDC to{" "}
                          {paymentSettingsState.merchantCurrency}, and withdraw the money to your bank.
                        </div>
                      </div>
                    </div>
                  )}
                  {/*--- question 1 ---*/}
                  <div className="mt-4 relative">
                    <span className="group">
                      <span className="link">What are the fees?</span>
                      {/*---tooltip---*/}
                      <div className="invisible group-hover:visible absolute bottom-[calc(100%+6px)] px-3 py-2 pointer-events-none bg-gray-100 border-gray-500 border rounded-lg z-10">
                        Fees for transferring funds are near zero. It costs ~0.10 USDC to transfer USDC from Flash to Coinbase. There is no transfer fee from Coinbase to your bank.
                      </div>
                    </span>
                  </div>
                  {/*--- question 2 ---*/}
                  <div className="mt-4 relative">
                    <span className="group">
                      <span className="link">What is the USDC to {paymentSettingsState.merchantCurrency} rate?</span>
                      {/*---tooltip---*/}
                      <div className="invisible group-hover:visible absolute bottom-[calc(100%+6px)] px-3 py-2 pointer-events-none bg-gray-100 border-gray-500 border rounded-lg z-10">
                        {paymentSettingsState.merchantCurrency == "USD"
                          ? "USDC is converted to USD at a 1:1 rate with no fees."
                          : `USDC is converted to ${paymentSettingsState.merchantCurrency} on the Coinbase orderbooks, which are highly liquid and usually offers a better rate than the USD to ${paymentSettingsState.merchantCurrency} rate at any bank, including Wise. The trading fee is negligible (0.01%).`}
                      </div>
                    </span>
                  </div>
                  {/*--- question 3 ---*/}
                  <div className="mt-4 relative">
                    <span className="group">
                      <span className="link">Will I lose money from fluctuating rates?</span>
                      {/*---tooltip---*/}
                      <div className="invisible group-hover:visible absolute bottom-[calc(100%+6px)] px-3 py-2 pointer-events-none bg-gray-100 border-gray-500 border rounded-lg z-10">
                        During payment, our interface adds 0.2% to the stablecoin-to-fiat rate on {cashoutSettingsState.cex} in favor of the business. Therefore, on average, you
                        should not lose money from fluctuating rates if you cash out regularly (e.g., once a week).
                      </div>
                    </span>
                  </div>
                </div>
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
