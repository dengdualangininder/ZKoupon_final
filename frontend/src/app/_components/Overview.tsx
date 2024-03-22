"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
// import components
import MockUI from "./MockUI";
// import constants
import { countryData, activeCountries, merchantType2data } from "@/utils/constants";
// import font awesome
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShop } from "@fortawesome/free-solid-svg-icons";

const Overview = () => {
  const [merchantName, setMerchantName] = useState("A Store in Europe");
  const [merchantCurrency, setMerchantCurrency] = useState("EUR");
  const [merchantCountry, setMerchantCountry] = useState("Europe");
  const [merchantWebsite, setMerchantWebsite] = useState("https://www.stablecoinmap.com");
  const [merchantPaymentType, setMerchantPaymentType] = useState("inperson");
  const [merchantBusinessType, setMerchantBusinessType] = useState("instore");
  const [merchantFields, setMerchantFields] = useState<string[]>([]);

  const router = useRouter();

  const onChangeCountryCurrency = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let countryCurrencyString = e.currentTarget.value;
    let merchantCountryTemp = countryCurrencyString.split(" (")[0];
    setMerchantCountry(merchantCountryTemp);
    setMerchantCurrency(countryCurrencyString.split(" (")[1].replace(")", ""));
    setMerchantName(
      `${merchantPaymentType === "inperson" ? "A Store in" : merchantType2data[merchantBusinessType]["merchantName"]} ${
        merchantCountryTemp == "Euro countries" ? "Europe" : merchantCountryTemp
      }`
    );
  };

  const onClickMerchantType = (e: React.MouseEvent<HTMLElement>) => {
    let merchantBusinessTypeTemp = e.currentTarget.id.replace("overview", "");
    setMerchantBusinessType(merchantBusinessTypeTemp);
    // highlights selected item to blue
    document.querySelectorAll("div[data-category='merchantBusinessType").forEach((i) => {
      if (e.currentTarget.id === i.id) {
        i.classList.add("border-gray-500");
        i.classList.remove("border-transparent");
      } else {
        i.classList.add("border-transparent");
        i.classList.remove("border-gray-500");
      }
    });
    // determine merchantPaymentType
    if (merchantBusinessTypeTemp === "instore") {
      setMerchantPaymentType("inperson");
      setMerchantFields([]);
      setMerchantName(`A Store in ${merchantCountry == "Euro countries" ? "Europe" : merchantCountry}`);
    } else {
      setMerchantPaymentType("online");
      setMerchantFields(merchantType2data[merchantBusinessTypeTemp]["merchantFields"]);
      setMerchantName(`${merchantType2data[merchantBusinessTypeTemp]["merchantName"]} ${merchantCountry == "Euro countries" ? "Europe" : merchantCountry}`);
    }
  };

  return (
    <div id="overviewEl" className="px-2.5 xs:px-4 lg:px-0 py-8 md:py-12 text-gray-800">
      {/*---TITLE + BUSINESS TYPES---*/}
      <div data-show="yes" className="flex flex-col items-center opacity-0 transition-all duration-1000">
        {/*---title---*/}
        <div className="font-extrabold text-3xl xs:text-5xl text-blue-700 xs:mb-1">How It Works</div>
        {/*---your currency + your business type---*/}
        <div className="flex flex-col items-center">
          <div className="mt-1 text-lg xs:text-base">Select a currency and business type</div>
          <div className="mt-1 flex flex-col items-center p-3 border border-gray-500 rounded-md">
            <div className="flex justify-center items-center px-4 py-2 border border-gray-500 rounded-[4px]">
              <select
                id="overviewCountryCurrency"
                className="px-1 text-lg lg:text-base border-gray-300 rounded-lg outline-none cursor-pointer border-transparent"
                onChange={onChangeCountryCurrency}
              >
                {activeCountries.map((i, index) => (
                  <option key={index} className="bg-white">
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-1">
              <div
                onClick={onClickMerchantType}
                id="overviewinstore"
                data-category="merchantBusinessType"
                className={`flex flex-col items-center cursor-pointer rounded-[4px] py-2 px-2 border border-gray-500 lg:hover:border-gray-500 transition-transform duration-300 backface-hidden relative`}
              >
                <div>
                  <FontAwesomeIcon icon={faShop} className="text-xl text-blue-500 pointer-events-none" />
                </div>
                <div className="text-lg lg:text-base leading-none lg:leading-tight text-center pointer-events-none">
                  In-Store
                  <br />
                  Payments
                </div>
              </div>
              {Object.keys(merchantType2data).map((i, index) => (
                <div
                  onClick={onClickMerchantType}
                  id={`overview${i}`}
                  data-category="merchantBusinessType"
                  key={index}
                  className="relative flex flex-col items-center cursor-pointer rounded-[4px] py-2 px-2 border border-transparent lg:hover:border-gray-500 transition-transform duration-300 backface-hidden"
                >
                  <div>
                    <FontAwesomeIcon icon={merchantType2data[i].fa} className="text-xl text-blue-500 pointer-events-none" />
                  </div>
                  <div className="text-lg lg:text-base leading-none text-center pointer-events-none">{merchantType2data[i].text}</div>
                  <div className="text-sm leading-none pointer-events-none text-center tracking-tight">
                    {merchantType2data[i].subtext ? `(${merchantType2data[i].subtext})` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*---PAYMENT FLOW CHART---*/}
      <div data-show="slide" className="mt-6 flex flex-col items-center lg:flex-row lg:items-start lg:justify-center space-y-8 lg:space-y-0 lg:space-x-12">
        {/*---step 1---*/}
        <div data-show="step" className="w-[356px] lg:w-[198px] flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out">
          {/*---title---*/}
          <div className="w-full flex items-center lg:justify-center text-blue-700">
            <div className="overviewNumber">1</div>
            <div className={`${merchantPaymentType === "inperson" ? "lg:w-[116px]" : "lg:w-[116px]"} overviewStepTitle`}>
              {merchantPaymentType === "inperson" ? "You display a QR code" : "You display a payment link"}
            </div>
          </div>
          {/*---QR Code---*/}
          {merchantPaymentType === "inperson" && (
            <div className="mt-1 lg:mt-3 relative">
              <div className="relative w-[198px] h-[280px]">
                <Image src="/placardCoinbaseCashback.svg" alt="placard" fill />
              </div>
              <QRCodeSVG
                xmlns="http://www.w3.org/2000/svg"
                size={100}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                value={`https://metamask.app.link/dapp/www.lingpay.io/${merchantPaymentType}/${merchantCurrency}&&My%20Store%20in%20Europe&&0x585d271CfD119ead6BdfbC0F7d104572E3D3824D&&USDC,USDT&&Polygon,BNB,Optimism,Arbitrum,Avalanche`}
                className="absolute top-[88px] left-[49px]"
              />
            </div>
          )}
          {/*---bullet points---*/}
          <div className="w-full mt-2 overviewStepBody">
            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div className="">
                <span onClick={() => router.push("/signup")} className="link">
                  create one
                </span>{" "}
                in just 5 minutes!
              </div>
            </div>
            {merchantPaymentType === "online" && (
              <div className="space-y-2 lg:space-y-1">
                <div className="flex">
                  <div className="mr-1">&bull;</div>
                  <div className="">Use the payment link to create a "Pay with MetaMask" button on your website</div>
                </div>
                <div className="flex">
                  <div className="mr-1">&bull;</div>
                  <div className="">Or, put the payment link on your online profile</div>
                </div>
                <div className="flex">
                  <div className="mr-1">&bull;</div>
                  <div className="">Or, display a QR code on any online medium</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/*---Step 2---*/}
        <div data-show="step" className="w-[356px] lg:w-[260px] flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out delay-200">
          {/*---title---*/}
          <div className="w-full flex items-center lg:justify-center text-blue-700">
            <div className="overviewNumber">2</div>
            <div className={`${merchantPaymentType === "inperson" ? "lg:w-[136px]" : "lg:w-[136px]"} overviewStepTitle`}>
              {merchantPaymentType === "inperson" ? "Customer scans and pays" : "Customer clicks link and pays"}
            </div>
          </div>
          {/*---mock UI---*/}
          <div className="mt-3">
            <MockUI
              {...{
                merchantName,
                merchantCurrency,
                merchantPaymentType,
                merchantBusinessType,
                merchantWebsite,
                merchantFields,
              }}
            />
          </div>
          {/*---bullet points---*/}
          <div className="mt-2 overviewStepBody">
            {["hotels", "taxis", "tours"].includes(merchantBusinessType) && (
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">
                  customer looks up <span className="font-bold">available dates</span>, <span className="font-bold">item names</span>, and <span className="font-bold">prices</span>{" "}
                  on your official website
                </div>
              </div>
            )}
            {["onlinephysical", "onlinedigital", "tickets", "gigs", "creators"].includes(merchantBusinessType) && (
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">
                  customer looks up <span className="font-bold">item names</span> and <span className="font-bold">prices</span> on your official website
                </div>
              </div>
            )}
            {["donations"].includes(merchantBusinessType) && (
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">supporter writes a message (optional)</div>
              </div>
            )}
            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div className="">
                {merchantBusinessType === "donations" ? "supporter" : "customer"} enters <span className="font-bold">amount of {merchantCurrency}</span> for{" "}
                {merchantBusinessType === "donations" ? "donation" : "payment"} and clicks "Send"
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-1">&bull;</div>
              <div className="w-full">
                {merchantCurrency == "USD" ? (
                  <div className="">
                    equal amount of{" "}
                    <span className="group">
                      <span className="link font-bold">USDC tokens</span>
                      <div className="invisible group-hover:visible absolute bottom-[20px] px-3 py-2 bg-gray-100 border border-gray-500 rounded-[4px]">
                        USDC is a USD stablecoin issued by Circle. 1 USDC is backed by 1 USD deposited in various U.S. banks (audited by Grant Thornton).
                      </div>
                    </span>
                  </div>
                ) : (
                  <span className="whitespace-nowrap">
                    stablecoins (of equal value
                    {merchantPaymentType === "inperson" && (
                      <span className="group">
                        <span className="link"> minus 2%</span>
                        <div className="invisible group-hover:visible whitespace-normal absolute w-[356px] lg:w-[260px] left-0 bottom-10 lg:text-sm lg:leading-tight px-3 py-2 bg-gray-100 border border-gray-500 rounded-[4px] leading-tight z-10">
                          The journey towards revolutionizing payments is a difficult one. Credit cards charge merchants 3% and give 1% to the customer, so customers have few
                          incentivizes to use other payment methods. To remain competitive, we require businesses who use our "In-Store Payments" to give 2% instant cashback to the
                          customer. With Ling Pay, businesses are still saving ~1% compared to credit cards. Furthermore, with this cashback, you are attracting new customers and
                          new revenue streams. Finally, would you rather give 3% to large corporations or 2% back to your loyal customers? To reiterate, all payments are P2P, so
                          Ling Pay takes zero fees. All savings are given to the customer.
                        </div>
                      </span>
                    )}
                    )
                  </span>
                )}{" "}
                are sent to your MetaMask wallet
              </div>
            </div>
            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div className="">
                payment is P2P, so we cannot take fees
                {merchantCurrency === "USD" ? "" : " and your customers always get the best token-to-fiat rates"}
              </div>
            </div>
          </div>
        </div>

        {/*---step 3---*/}
        <div data-show="step" className="w-[356px] lg:w-[220px] flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out delay-400">
          {/*---title---*/}
          <div className="w-full flex items-center lg:justify-center text-blue-700">
            <div className="overviewNumber">3</div>
            {merchantPaymentType === "inperson" && <div className="lg:w-[136px] overviewStepTitle">You verify and record payment</div>}
            {merchantPaymentType === "online" && <div className="lg:w-[152px] overviewStepTitle">You receive email of purchase order</div>}
          </div>
          {/*---image and bullet points---*/}
          {merchantPaymentType === "inperson" && (
            <div className="mt-2 overviewStepBody">
              <div className="flex relative">
                <div className="mr-1">&bull;</div>
                <div className="">
                  view verified payments in our App or ask the customer to show you the{" "}
                  <span className="group">
                    <span className="link">Payment Completed</span>
                    <div className="invisible group-hover:visible absolute w-[204px] lg:w-[184px] bottom-[52px] lg:bottom-[38px] left-[calc((100%-204px)/2)] lg:left-[calc((100%-184px)/2)] leading-tight px-3 py-2 bg-gray-100 border border-gray-500 rounded-[4px]">
                      click "Send" in the phone interface for a preview
                    </div>
                  </span>{" "}
                  page
                </div>
              </div>
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">record payment in your PoS system as a cash payment</div>
              </div>
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">download spreadsheets of payment history</div>
              </div>
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">refund payments with 1 click in our App</div>
              </div>
            </div>
          )}
          {merchantPaymentType === "online" && (
            <div className="mt-2 overviewStepBody">
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">email contains all order details</div>
              </div>
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">refund payments with 1 click</div>
              </div>
              <div className="flex">
                <div className="mr-1">&bull;</div>
                <div className="">download spreadsheets of payments history</div>
              </div>
              <div className="flex">
                <div className="mr-1">*</div>
                <div className="">above features require the Automation Package</div>
              </div>
            </div>
          )}
        </div>

        {/*---step 4---*/}
        <div data-show="step" className="w-[354px] lg:w-[320px] flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out delay-600">
          {/*---title---*/}
          <div className="w-full flex items-center lg:justify-center text-blue-700">
            <div className="overviewNumber">4</div>
            <div className="overviewStepTitle">
              You cash out on{" "}
              {merchantCurrency == "USD" ? (
                <span>Coinbase Exchange</span>
              ) : (
                <span>
                  a<br />
                  cryptocurrency exchange
                </span>
              )}
            </div>
          </div>
          <div className="relative w-[354px] lg:w-[320px] h-[300px] mt-4 lg:mt-3 border rounded-lg overflow-hidden border-gray-300">
            <Image src="/overviewTrade.png" alt="trade" fill />
          </div>
          {/*---bullet points---*/}
          <div className="mt-2 overviewStepBody">
            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div className="">
                create an account on{" "}
                {merchantCurrency === "USD" ? (
                  <span className="link">
                    <a href="https://www.coinbase.com/signup" target="_blank">
                      Coinbase
                    </a>
                  </span>
                ) : (
                  "a cryptocurrency exchange"
                )}
              </div>
            </div>
            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div className="">
                {merchantCurrency === "USD"
                  ? "convert USDC to USD at a 1:1 rate (no fees) and withdraw money to your bank (no fees)"
                  : `convert stablecoins to ${merchantCurrency} and withdraw money to your bank`}
              </div>
            </div>

            <div className="flex">
              <div className="mr-1">&bull;</div>
              <div>
                or, activate the <span className="font-bold">Automation Package</span> ($0-5/month) and receive money in your bank with just 1 click in our App (no fees)
              </div>
            </div>

            {merchantCurrency != "USD" && (
              <div className="flex relative">
                <div className="mr-1">&bull;</div>
                <div className="">
                  you will not lose from exchange rates (
                  <span className="group">
                    <span className="link">how?</span>
                    <div className="invisible group-hover:visible absolute w-[354px] xs:w-[320px] left-0 bottom-8 px-3 py-2 bg-gray-100 border border-gray-500 rounded-[4px] leading-tight">
                      Our interface adds 0.3~0.5% to the rate in favor of the business (businesses might even earn a little extra). If the payment token corresponds to the local
                      currency (customer pays USDC and the local currency is USD), the rate will be 1:1.
                    </div>
                  </span>
                  )
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
