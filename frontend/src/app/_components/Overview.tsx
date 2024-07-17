"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
// import components
import MockUI from "./MockUI";
// import constants
import { countryData, currencyList, merchantType2data } from "@/utils/constants";
// import font awesome
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShop } from "@fortawesome/free-solid-svg-icons";

const Overview = ({ merchantCurrency, setMerchantCurrency }: { merchantCurrency: string; setMerchantCurrency: any }) => {
  const [merchantName, setMerchantName] = useState("A Store in Europe");
  const [merchantCountry, setMerchantCountry] = useState("US");
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
    <div id="overviewEl" className="w-full flex flex-col items-center py-16">
      {/*--- header + select currency ---*/}
      <div data-show="yes" className="opacity-0 transition-all duration-1000">
        {/*--- header ---*/}
        <div className="homeHeaderFont text-center">How It Works</div>
        {/*--- select currency ---*/}
        <div className="my-12 pb-4 w-full flex flex-col sm:flex-row justify-center items-center">
          <label className="sm:mr-3 overviewHeader2Font">Select your currency: </label>
          <select
            className="mt-4 sm:mt-0 h-[44px] sm:h-[36px] py-0 font-medium pr-10 text-xl sm:text-base leading-none border bg-dark6 border-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors duration-500 rounded-md"
            onChange={async (e) => {
              const merchantCurrencyTemp = e.target.value;
              setMerchantCurrency(merchantCurrencyTemp);
            }}
            value={merchantCurrency}
          >
            {currencyList.map((i, index) => (
              <option key={index}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/*--- STEPS ---*/}
      <div
        data-show="slide"
        className="sm:w-[90%] sm:min-w-[588px] md:min-w-[720px] md:max-w-[820px] lg:min-w-[920px] xl:desktop:w-full xl:desktop:max-w-[1240px] grid grid-cols-[350px] sm:grid-cols-[280px_280px] md:grid-cols-[350px_350px] lg:grid-cols-[400px_400px] xl:desktop:grid-cols-[222px_280px_280px_280px] justify-center sm:justify-between gap-y-16 sm:gap-y-10 lg:gap-y-16 xl:desktop:gap-x-10"
      >
        {/*---step 1---*/}
        <div data-show="step" className="w-full xl:desktop:w-[222px] flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out space-y-4">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="overviewNumber">1</div>
            <div className={`overviewStepTitle`}>You display a QR code</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-[180px] h-[260px] sm:h-[368px]">
            <Image src={"/placardNoCashback.png"} alt="placardNoCashback" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="overviewBulletPoints">
            You receive the QR code after setting up (
            <span className="linkDark" onClick={() => router.push("/app")}>
              set up in 1 minute
            </span>
            )
          </div>
        </div>

        {/*---Step 2---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out space-y-4 delay-200">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="overviewNumber">2</div>
            <div className="overviewStepTitle">Customer scans and pays with MetaMask</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phonePay.png"} alt="phonePay" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="overviewBulletPoints">
            <div className="flex relative">
              <div className="mr-2.5">1.</div>
              <div className="">
                When the customer scans your QR code, their{" "}
                <span className="group">
                  <span className="linkDark">
                    MetaMask app<sup>?</sup>
                  </span>
                  <div className="w-full bottom-[calc(100%+4px)] left-0 overviewTooltip">
                    MetaMask is the most popular app to send/receive tokens and is used by 50+ million people worldwide.
                  </div>
                </span>{" "}
                will open
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-2">2.</div>
              <div className="">
                The customer <span className="font-semibold">enters the amount of {merchantCurrency} for payment</span>
              </div>
            </div>
            <div className="flex relative">
              <div className="mr-2">3.</div>
              <div>
                When the customer submits payment,{" "}
                <span className="group">
                  <span className="linkDark">
                    USDC tokens<sup>?</sup>
                  </span>
                  <div className="bottom-[calc(100%+8px)] left-0 overviewTooltip">1 USDC token equals to 1 USD, as gauranteed by Circle. Almost all crypto users have USDC.</div>
                </span>{" "}
                {merchantCurrency == "USD" ? "" : <span>&#40;with a value equal to the amount of {merchantCurrency} entered&#41;</span>} will be sent from their MetaMask to your
                Flash app
              </div>
            </div>
          </div>
        </div>

        {/*---step 3---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out space-y-4 delay-400">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="overviewNumber">3</div>
            <div className="overviewStepTitle">You confirm payment on the Flash app</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneConfirmPayment.png"} alt="phoneConfirmPayment" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---image and bullet points---*/}
          <div className="overviewBulletPoints">
            <div>
              About 5 seconds after a customer pays, you should see the payment in the Flash app. Employees can also log into your Flash app (with restricted functions) on a shared
              or personal device to see successful payments
            </div>
          </div>
        </div>

        {/*---step 4---*/}
        <div data-show="step" className="w-full flex flex-col items-center translate-x-[1500px] transition-all duration-1500 ease-out space-y-4 delay-600">
          {/*---title---*/}
          <div className="w-full flex items-center">
            <div className="overviewNumber">4</div>
            <div className="overviewStepTitle">You cash out</div>
          </div>
          {/*--- image ---*/}
          <div className="relative w-full h-[368px]">
            <Image src={"/phoneCashOut.png"} alt="phoneCashOut" fill style={{ objectFit: "contain" }} />
          </div>
          {/*---bullet points---*/}
          <div className="overviewBulletPoints">
            {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
              <div>
                To transfer funds to your bank, you must have a Coinbase account (
                <span className="linkDark">
                  <a href="https://www.coinbase.com/signup" target="_blank">
                    sign up here
                  </a>
                </span>
                )
              </div>
            )}
            {merchantCurrency == "TWD" && (
              <div>
                To transfer funds to your bank, you must have a MAX Exchange account (
                <span className="linkDark">
                  <a href="https://max.maicoin.com/signup" target="_blank">
                    sign up here
                  </a>
                </span>
                )
              </div>
            )}
            <div className="flex">
              <div className="mr-2.5">1.</div>
              <div className="">
                {(merchantCurrency == "USD" || merchantCurrency == "EUR") && <div>In the Flash app, click "Link Coinbase Account"</div>}
                {merchantCurrency == "TWD" && <div>Copy your MAX account's USDC deposit address (for Polygon) and paste it in the "Settings" menu of the Flash app</div>}
              </div>
            </div>
            <div className="flex">
              <div className="mr-2">2.</div>
              <div className="">
                {(merchantCurrency == "USD" || merchantCurrency == "EUR") && (
                  <div>
                    Click "Cash Out" and follow the on-screen instructions. USDC will be automatically converted to {merchantCurrency == "USD" ? "USD at a 1:1 rate" : "EUR*"} and
                    the money sent to your bank (~0% fees)
                  </div>
                )}
                {merchantCurrency == "TWD" && <div>In the "Cash Out" menu, click "Transfer to MAX"</div>}
              </div>
            </div>

            {merchantCurrency == "TWD" && (
              <div className="flex">
                <div className="mr-2">3.</div>
                <div>Log into your MAX account. Sell USDC for TWD* and withdraw the money to your bank.</div>
              </div>
            )}

            {merchantCurrency != "USD" && (
              <div className="flex relative">
                <div className="mr-2">&nbsp;*</div>
                <div className="">
                  Flash is designed so that you will not lose money from fluctuating exchange rates (
                  <span className="group">
                    <span className="linkDark">how?</span>
                    <div className="w-full bottom-[calc(100%+4px)] left-0 overviewTooltip">
                      When a customer pays, our interface alters the USDC-{merchantCurrency} rate by 0.3% in favor of the business. So, you actually earn an extra 0.3%. In the long
                      run, these extra earnings should offset any losses due to fluctuating rates, if you cash out frequently (~2x per month). Customers will not mind the extra
                      0.3% because the USDC-to-{merchantCurrency} rate offered by Flash is usually 1-5% better than the USD-to-{merchantCurrency} rate at any bank.
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
