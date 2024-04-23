//next
import Image from "next/image";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
// types
import { Rates } from "@/utils/types";
import { currency2decimal } from "@/utils/constants";

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
    <div className="w-full h-full flex flex-col items-center justify-evenly text-2xl font-bold">
      {/*---Pay To---*/}
      <div className="w-full flex flex-col items-center">
        <div className="text-base font-medium text-gray-400">PAY TO</div>
        <div className="line-clamp-1">{urlParams.merchantName}</div>
      </div>

      {/*---payment amount---*/}
      <div className="relative w-full h-[66px] flex items-center border-2 border-blue-500 rounded-md bg-white">
        <label className="w-[90px] border-r border-gray-400 text-center flex-none text-2xl font-bold">{urlParams.merchantCurrency}</label>
        <input
          className="w-[calc(100%-90px-90px)] font-bold text-center text-2xl outline-none bg-transparent focus:placeholder:invisible placeholder:font-medium placeholder:text-xl"
          type="number"
          inputMode="decimal"
          value={currencyAmount}
          onChange={(e) => {
            setCurrencyAmount(e.currentTarget.value);
            setTokenAmount((Number(e.currentTarget.value) / rates.usdcToLocal).toFixed(currency2decimal[urlParams.merchantCurrency]));
            // setShowNetwork(true);
          }}
          placeholder="Enter Amount"
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
        <div className="flex text-center">
          {tokenAmount} {selectedToken} will be sent
        </div>
        {/*--- SAVINGS ---*/}
        <div className="w-full mt-2 flex justify-between text-sm text-gray-400 font-medium tracking-tighter relative">
          {/*--- FX Savings ---*/}
          {urlParams.merchantCurrency != "USD" && (
            <div className="flex items-center group">
              <div className="flex flex-col items-center">
                <div>FX Savings</div>
                <div className="font-bold text-green-500">{fxSavings}%</div>
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
              <p className="font-bold text-green-500">2%</p>
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
                <div className="font-bold text-green-500">{2 + Number(fxSavings)}%</div>
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/*---SEND BUTTON---*/}
      <div className={`${currencyAmount ? "" : "invisible"} mb-4 flex justify-center w-full`}>
        <button onClick={send} className="w-[300px] py-5 text-white bg-blue-500 active:opacity-50 rounded-full">
          SEND
        </button>
      </div>
    </div>
  );
};

export default Inperson;
