import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Lottie from "lottie-react";
// import utils
import { merchantType2data } from "@/utils/constants";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import circleCheck from "@/utils/lotties/circleCheck.json";
// import images
import usdcSvg from "/public/usdc.svg";
// import font awesome icons
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const MockUI = ({
  merchantName,
  merchantCurrency,
  merchantPaymentType,
  merchantBusinessType,
  merchantWebsite,
  merchantFields,
}: {
  merchantName: string;
  merchantCurrency: string;
  merchantPaymentType: string;
  merchantBusinessType: string;
  merchantWebsite: string;
  merchantFields: string[];
}) => {
  const [u2local, setu2local] = useState<{ [key: string]: number }>({ USD: 1, USDC: 1, USDT: 1 });
  const [payModal, setPayModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | boolean>(false);
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [currencyAmount, setCurrencyAmount] = useState(0);

  const selectedToken = "USDC";
  const usdcBalance = 128.33;

  useEffect(() => {
    console.log("USEEFFECT getRates run once");
    const getRates = async (merchantCurrency: string) => {
      console.log("requesting rates api");
      let USDres = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usd!B4:AE4?key=${process.env.GOOGLE_API_KEY}`
      );
      let USDTres = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdt!B4:AE4?key=${process.env.GOOGLE_API_KEY}`
      );
      let USDCres = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/1TszZIf9wFoAQXQf0-TGi203lgMhSiSSHxQn1yVLtnLA/values/usdc!B4:AE4?key=${process.env.GOOGLE_API_KEY}`
      );
      let sheetCountryOrder = "twd, jpy, krw, hkd, sgd, php, thb, idr, myr, vnd, eur, gbp, cad, aud, usd".split(", ").map((i) => i.toUpperCase());
      let sheetIndex = sheetCountryOrder.findIndex((i) => i == merchantCurrency);
      setu2local({
        USD: Number(USDres.data.values[0][sheetIndex * 2].toPrecision(4)),
        USDC: Number(USDCres.data.values[0][sheetIndex * 2].toPrecision(4)),
        USDT: Number(USDTres.data.values[0][sheetIndex * 2].toPrecision(4)),
      });
    };
    getRates(merchantCurrency);
  }, [merchantCurrency]);

  const send = () => {
    if (Number((currencyAmount / u2local[selectedToken]).toFixed(2)) > usdcBalance) {
      setErrorModal(true);
      setErrorMsg("Insufficient balance");
    } else if (!currencyAmount) {
      setErrorModal(true);
      setErrorMsg("Please enter payment amount");
    } else {
      setPayModal(true);
      setTimeout(() => {
        setIsSendingComplete(true);
      }, 1000);
    }
  };

  const clickDown = () => {
    document.getElementById("mockModalBg")?.classList.remove("bg-white");
    document.getElementById("mockModalBg")?.classList.add("bg-gradient-to-br", "from-indigo-200", "via-red-200", "to-yellow-100");
  };
  const clickUp = () => {
    document.getElementById("mockModalBg")?.classList.remove("bg-gradient-to-br", "from-indigo-200", "via-red-200", "to-yellow-100");
    document.getElementById("mockModalBg")?.classList.add("bg-white");
  };

  return (
    <div className="relative">
      <div className="relative w-[220px] h-[414px]">
        <Image src="/phone.png" alt="phone" objectFit="contain" fill />
      </div>
      <div className="absolute left-[15px] top-[31px] w-[190px] h-[366px] px-1 pb-2 flex rounded-b-2xl text-black text-xs font-bold overflow-x-hidden overflow-y-auto thinScroll">
        <div className="w-full flex flex-col my-auto items-center">
          {/*---top fields---*/}
          <div className="w-full flex flex-col justify-center">
            {/*---pay to---*/}
            <div className={`${merchantPaymentType === "inperson" ? "flex flex-col mb-2" : "flex"} items-center`}>
              <div className={`${merchantPaymentType === "inperson" ? "mb-2" : "w-[54px] flex-none"}`}>Pay To</div>
              <div className="flex items-center">
                <div className="text-sm font-extrabold leading-none line-clamp-2">{merchantName}</div>
                {merchantPaymentType === "online" && merchantWebsite && (
                  <div className="ml-0.5 text-[8px] leading-none w-[37px] text-center link">
                    <a href={merchantWebsite} target="_blank">
                      OFFICIAL WEBSITE
                    </a>
                  </div>
                )}
              </div>
            </div>
            {merchantPaymentType === "online" && (
              <div className="w-full">
                {/*---email---*/}
                <div className={`${merchantFields.includes("email") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none">Email</div>
                  <div className="w-full h-[18px] rounded-[4px] border border-slate-300"></div>
                </div>
                {/*---daterange---*/}
                <div className={`${merchantFields.includes("daterange") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">Dates</div>
                  <div className="flex">
                    <div className="w-[70px] font-normal text-slate-400 rounded-[4px] border border-slate-300 px-1 text-center">Start Date</div>
                    <div className="mx-1">to</div>
                    <div className="w-[70px] font-normal text-slate-400 rounded-[4px] border border-slate-300 px-1 text-center">End Date</div>
                    <div></div>
                  </div>
                </div>
                {/*---date---*/}
                <div className={`${merchantFields.includes("date") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">Date</div>
                  <div className="w-full h-[18px] rounded-[4px] border border-slate-300"></div>
                </div>
                {/*---time---*/}
                <div className={`${merchantFields.includes("time") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">Time</div>
                  <div className="w-full h-[18px] rounded-[4px] border border-slate-300"></div>
                </div>
                {/*---guests---*/}
                <div className={`${merchantFields.includes("count") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">Guests</div>
                  <div className="flex items-center">
                    <div className="w-[16px] h-[16px] border border-slate-300 rounded-full flex justify-center items-center text-slate-400">&ndash;</div>
                    <div className="mx-1 flex items-center leading-none font-normal">
                      <div className="font-bold">2</div>
                      <div className="ml-0.5 text-[10px]">adults</div>
                    </div>
                    <div className="w-[16px] h-[16px] border border-slate-300 rounded-full flex justify-center items-center text-slate-400">+</div>
                    <div className="w-[12px]"></div>
                    <div className="w-[16px] h-[16px] border border-slate-300 rounded-full flex justify-center items-center text-slate-400">&ndash;</div>
                    <div className="mx-1 flex items-center leading-none font-normal">
                      <div className="font-bold">2</div>
                      <div className="ml-0.5 text-[10px]">kids</div>
                    </div>
                    <div className="w-[16px] h-[16px] border border-slate-300 rounded-full flex justify-center items-center text-slate-400">+</div>
                  </div>
                </div>
                {/*---item name---*/}
                <div className={`${merchantFields.includes("item") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">{merchantPaymentType === "online" ? merchantType2data[merchantBusinessType]["itemlabel"] : "Item Name"}</div>
                  <div className="w-full h-[18px] rounded-[4px] text-sm border border-slate-300"></div>
                </div>
                {/*---SKU---*/}
                <div className={`${merchantFields.includes("sku") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">SKU#</div>
                  <div className="w-1/4 h-[18px] rounded-[4px] text-sm border border-slate-300"></div>
                </div>
                {/*---shipping address---*/}
                <div className={`${merchantFields.includes("shipping") ? "" : "hidden"} mt-1 flex items-center`}>
                  <div className="w-[54px] flex-none leading-none">Shipping Address</div>
                  <div className="w-full h-[44px] rounded-[4px] text-sm border border-slate-300"></div>
                </div>
              </div>
            )}
          </div>
          {/*---payment + network + token + fx + send---*/}
          <div className="mt-1 flex flex-col items-center justify-center relative">
            {/*---amount + networks + tokens---*/}
            <div className="flex flex-col items-center">
              {merchantPaymentType === "online" ? <div className="text-sm">Payment</div> : null}
              <div className="w-[180px] text-sm border rounded-[4px] border-blue-500 h-[32px] flex items-center relative">
                <div className="absolute left-[4px] leading-none">{merchantCurrency ? merchantCurrency : "USD"}</div>
                <input
                  id="mockCurrencyAmount"
                  className="ml-1 leading-none text-black w-full text-center outline-none"
                  placeholder="Enter Amount"
                  type="number"
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    setCurrencyAmount(Number(e.currentTarget.value));
                  }}
                ></input>
              </div>
            </div>
            {/*---X tokens will be sent---*/}
            <div className="mt-2 text-sm font-bold text-center">
              {((currencyAmount * 0.98) / u2local[selectedToken]).toFixed(2)} {selectedToken} will be sent
            </div>
            {/*---FX rates + savings---*/}
            <div className="w-full flex flex-col">
              {/*---fx rates---*/}
              {merchantCurrency === "USD" ? null : (
                <div className="w-full flex font-normal justify-center text-[8px] leading-none tracking-tighter font-sans">
                  <div className="w-1/2 flex flex-col items-center text-center">
                    <div>CEX Rate</div>
                    <div id="yourRate">
                      1 {selectedToken} &#8652; {u2local[selectedToken]} {merchantCurrency}
                    </div>
                  </div>
                  <div className="w-1/2 flex flex-col items-center text-center">
                    <div>Bank Rate</div>
                    <div>
                      1 USD &#8652; {u2local.USD} {merchantCurrency}
                    </div>
                  </div>
                </div>
              )}
              {/*---savings---*/}
              <div className="mt-1 w-full flex font-normal justify-center text-[8px] leading-none tracking-tighter font-sans">
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div>FX Savings</div>
                  <div>
                    {Number(u2local[selectedToken]) > Number(u2local.USD) ? (
                      <div className="font-bold text-green-500">+{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
                    ) : (
                      <div className="font-bold text-red-500">{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
                    )}
                  </div>
                </div>
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div>Instant Cashback</div>
                  <div className="font-bold text-green-500">+2%</div>
                </div>
                <div className="w-1/3 flex flex-col items-center text-center">
                  <div>Total Savings</div>
                  <div>
                    {Number(u2local[selectedToken]) > Number(u2local.USD) ? (
                      <div className="font-bold text-green-500">+{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
                    ) : (
                      <div className="font-bold text-red-500">{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/*---send button---*/}
            <button onClick={send} className="mt-2 w-[180px] h-[36px] text-sm font-bold text-white bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px]">
              SEND
            </button>
          </div>
          {/*---UI caption---*/}
          <div className="hidden w-full absolute left-[4px] bottom-[-32px] text-slate-700">
            <div className="w-full text-xs leading-tight font-normal">
              <span className="font-bold">Play with me!</span> Enter any amount, select a network, select a token, and click "Send".
            </div>
          </div>
        </div>
      </div>
      {errorModal && (
        <div>
          <div className="absolute top-[15px] left-[16px] w-[228px] h-[453px] bg-black opacity-50 z-10 rounded-2xl"></div>
          <div className="absolute top-[92px] left-[30px] w-[200px] h-[220px] py-6 px-0 text-slate-700 bg-white rounded-lg z-[50]">
            {/*---container---*/}
            <div className="h-full w-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6">
              {/*---Error---*/}
              <div className="text-lg font-bold text-slate-700 text-center">Error</div>
              {/*---msg---*/}
              <div className="mb-4 text-center text-sm">{errorMsg}</div>
              {/*---close button---*/}
              <button
                onClick={() => {
                  setErrorModal(false);
                  (document.getElementById("mockCurrencyAmount") as HTMLInputElement).value = "";
                  setCurrencyAmount(0);
                }}
                className="w-[140px] h-[36px] text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-300 rounded-[3px] tracking-wide"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
      {/*---paid modal---*/}
      {payModal && merchantPaymentType === "online" && (
        <div>
          <div className="absolute top-[15px] left-[16px] w-[228px] h-[453px] bg-black opacity-50 z-10 rounded-2xl"></div>
          <div className="absolute top-[92px] left-[30px] w-[200px] h-[300px] py-6 px-2 text-slate-700 bg-white rounded-xl z-[50]">
            {isSendingComplete ? (
              <div className="h-full flex flex-col justify-between items-center">
                {/*---store name---*/}
                <div className="text-center">
                  <div className="mt-0 font-bold text-[14px] text-green-500">PAYMENT COMPLETED</div>
                  <FontAwesomeIcon className=" text-[20px] text-green-500" icon={faCircleCheck} />
                </div>
                {/*---amount---*/}
                <div className="flex flex-col text-center">
                  <div className="text-base font-bold">
                    {currencyAmount} {merchantCurrency}
                  </div>
                  <div className="text-xs">sent to</div>
                  <div className="text-base font-bold">{merchantName}</div>
                  {merchantPaymentType === "online" ? <div className="mt-4 text-xs">An email with the purchase details has been sent to you.</div> : null}
                </div>
                {/*---close---*/}
                <button
                  onClick={() => {
                    setPayModal(false);
                    setIsSendingComplete(false);
                    (document.getElementById("mockCurrencyAmount") as HTMLInputElement).value = "";
                    setCurrencyAmount(0);
                  }}
                  className="w-[160px] h-[36px] text-sm text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-300 font-bold rounded-[3px]"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <SpinningCircleGray />
              </div>
            )}
          </div>
        </div>
      )}
      {payModal && merchantPaymentType === "inperson" && (
        <div className="">
          <div className="absolute top-[15px] left-[16px] w-[228px] h-[453px] bg-black opacity-50 z-10 rounded-2xl"></div>
          <div
            id="mockModalBg"
            onPointerDown={clickDown}
            onPointerUp={clickUp}
            className="absolute top-[92px] left-[30px] w-[200px] h-[260px] py-5 px-2 text-slate-700 bg-white rounded-lg z-[50]"
          >
            {isSendingComplete ? (
              <div className="h-full flex flex-col items-center justify-between text-gray-600">
                {/*---store name---*/}
                <div className="text-center relative flex flex-col items-center">
                  <div className="text-sm font-extrabold text-green-500">PAYMENT COMPLETED</div>
                  <Lottie animationData={circleCheck} loop={true} className="absolute top-[4px] h-[72px]" />
                </div>
                {/*---amount and time---*/}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-3xl flex items-center font-bold">
                    {currencyAmount}
                    <span className="ml-2 font-bold text-xl">{merchantCurrency}</span>
                  </div>
                  <div className="mt-3 font-bold text-xl">{new Date().toLocaleString([], { timeStyle: "short" })}</div>
                </div>
                {/*---close---*/}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    setPayModal(false);
                    setIsSendingComplete(false);
                    (document.getElementById("mockCurrencyAmount") as HTMLInputElement).value = "";
                    setCurrencyAmount(0);
                  }}
                  className="mb-1 w-[160px] h-[36px] text-sm text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-300 font-bold rounded-[3px]"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <SpinningCircleGray />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockUI;
