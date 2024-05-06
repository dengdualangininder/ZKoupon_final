//next
import Image from "next/image";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
// types
import { Rates } from "@/utils/types";
import { currency2decimal, currency2symbol } from "@/utils/constants";

const Inperson = ({
  urlParams,
  currencyAmount,
  setCurrencyAmount,
  showNetwork,
  setShowNetwork,
  merchantNetworks,
  selectedNetwork,
  selectedToken,
  onClickNetwork,
  rates,
  isGettingBalance,
  USDCBalance,
  send,
  fxSavings,
  tokenAmount,
  setTokenAmount,
}: {
  urlParams: any;
  currencyAmount: string;
  setCurrencyAmount: any;
  showNetwork: boolean;
  setShowNetwork: any;
  merchantNetworks: any;
  selectedNetwork: string;
  selectedToken: string;
  onClickNetwork: any;
  rates: Rates;
  isGettingBalance: boolean;
  USDCBalance: string;
  send: any;
  fxSavings: string;
  tokenAmount: string;
  setTokenAmount: any;
}) => {
  return (
    <div className="w-full h-full max-h-[600px] flex flex-col items-center justify-between text-2xl font-medium">
      {/*---blank---*/}
      <div></div>
      {/*---Pay To---*/}
      <div className="w-full flex flex-col items-center">
        <div className="text-base font-normal">PAY TO</div>
        <div className="mt-2 font-medium line-clamp-1">{urlParams.merchantName}</div>
      </div>

      {/*---payment amount---*/}
      {/* <div className="relative w-full h-[66px] flex items-center border-2 border-blue-500 rounded-xl bg-white">
        <label className="w-[90px] border-r border-gray-400 text-center flex-none">{urlParams.merchantCurrency}</label>
        <input
          className="w-[calc(100%-90px-90px)] text-center outline-none bg-transparent focus:placeholder:invisible placeholder:font-medium placeholder:text-xl"
          type="number"
          inputMode="decimal"
          value={currencyAmount}
          onChange={(e) => {
            setCurrencyAmount(e.currentTarget.value);
            setTokenAmount(((Number(e.currentTarget.value) / rates.usdcToLocal) * 0.98).toFixed(currency2decimal[urlParams.merchantCurrency]));
            // setShowNetwork(true);
          }}
          placeholder="Enter Amount"
        ></input>
      </div> */}
      <div className="flex justify-center items-end text-3xl relative">
        <div className="absolute right-[calc(100%+8px)] font-normal">{currency2symbol[urlParams.merchantCurrency]}</div>
        <input
          onChange={(e) => {
            setCurrencyAmount(e.currentTarget.value);
            setTokenAmount(((Number(e.currentTarget.value) / rates.usdcToLocal) * 0.98).toFixed(currency2decimal[urlParams.merchantCurrency]));
          }}
          type="number"
          inputMode="decimal"
          value={currencyAmount}
          placeholder="0.00"
          className="w-[160px] outline-none text-center border-b focus:placeholder:text-transparent bg-white"
        ></input>
      </div>

      {/*---select network---*/}
      {/* <div className={`${showNetwork ? "" : "invisible"} w-[340px] flex flex-col items-center`}>
        <div className="text-xl font-bold">Select a network:</div>
        <div className="w-full ">Polygon</div>
        {merchantNetworks.map((i: any) => (
          <div key={i.name} className={` flex flex-col items-center`}>
            <div
              id={i.name}
              data-category="network"
              onClick={onClickNetwork}
              className={`${
                selectedNetwork == i.name ? "bg-gray-100 border-gray-100" : `${selectedNetwork ? "bg-white border-gray-100 opacity-50" : "bg-white border-gray-100"}`
              } h-[58px] w-[58px] flex flex-col justify-center items-center pt-1 pb-0.5 text-[10px] text-center active:bg-gray-200 border rounded-full drop-shadow-md cursor-pointer`}
            >
              <div className="relative w-[22px] h-[22px]">
                <Image src={i.img} alt={i.name} fill />
              </div>
              <div className="leading-tight pointer-events-none">{i.name}</div>
              <div className="leading-tight pointer-events-none">${i.gas}</div>
            </div>
          </div>
        ))}
      </div> */}

      {/*---AMOUNT SENT + SAVINGS---*/}
      <div className={`${currencyAmount ? "" : "invisible"} w-full flex flex-col items-center`}>
        {/*--- AMOUNT SENT ---*/}
        <div className="flex text-center text-lg font-bold">
          Sending {tokenAmount} {selectedToken}
        </div>
        {/*--- SAVINGS ---*/}
        <div className="w-full mt-2 flex justify-between text-sm text-gray-400 font-medium relative">
          {/*--- FX Savings ---*/}
          {urlParams.merchantCurrency != "USD" && (
            <div className="flex items-center group">
              <div className="flex flex-col items-center">
                <div>FX Savings</div>
                <div className="font-bold text-green-500 text-base">{fxSavings}%</div>
                {/*--- tooltip ---*/}
                <div className="w-full bottom-[calc(100%+2px)] left-0 tooltip text-start text-gray-800">
                  <p>
                    Your Rate: 1 {selectedToken} &rarr; {rates.usdcToLocal} {urlParams.merchantCurrency}
                  </p>
                  <p>
                    Bank Rate: 1 USD &rarr; {rates.usdToLocal} {urlParams.merchantCurrency}
                  </p>
                </div>
              </div>
              <FontAwesomeIcon icon={faCircleInfo} className="ml-1 text-sm text-gray-300" />
            </div>
          )}

          {/*--- instant cashback ---*/}
          <div className="flex items-center group">
            <div className="flex flex-col items-center text-center">
              <p>Instant Cashback</p>
              <p className="font-bold text-green-500 text-base">2%</p>
              {/*--- tooltip ---*/}
              <div className="w-full bottom-[calc(100%+2px)] tooltip text-start text-gray-800">The value of USDC sent is 2% less than the value of the payment amount</div>
            </div>
            <FontAwesomeIcon icon={faCircleInfo} className="ml-1 text-sm text-gray-300" />
          </div>

          {/*--- total savings ---*/}
          {urlParams.merchantCurrency != "USD" ? (
            <div className="flex flex-col items-center text-center">
              <p>You Save</p>
              <div>
                <div className="font-bold text-green-500 text-base">{2 + Number(fxSavings)}%</div>
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/*---SEND BUTTON---*/}
      <div className={`${currencyAmount ? "" : "invisible"} mb-8 flex justify-center w-full`}>
        <button onClick={send} className="w-full h-[60px] text-white bg-blue-500 active:opacity-50 rounded-xl text-xl">
          PAY
        </button>
      </div>
    </div>
  );
};

export default Inperson;
