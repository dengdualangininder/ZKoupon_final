//next
import Image from "next/image";
// types
import { U2local } from "../page";

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
  u2local,
  isGettingBalance,
  USDCBalance,
  send,
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
  u2local: U2local;
  isGettingBalance: boolean;
  USDCBalance: string;
  send: any;
}) => {
  return (
    <div className="flex flex-col items-center h-[calc(100%-24px)] justify-evenly text-gray-800">
      {/*---Pay To---*/}
      <div className="w-full px-2 flex flex-col items-center">
        <div className="text-base font-medium text-gray-400">PAY TO</div>
        <div className="text-2xl font-bold line-clamp-1">{urlParams.merchantName}</div>
      </div>

      {/*---payment amount + networks ---*/}
      <div className="w-full flex flex-col items-center">
        {/*---payment amount---*/}
        <div
          id="inpersonCurrencyAmountBox"
          className="w-[340px] h-[66px] flex items-center border-[2px] rounded-[24px] relative bg-white border-gray-100 transition-[border-color] duration-[400ms] drop-shadow-md"
        >
          <label className="w-[88px] border-r-2 border-gray-300 text-center flex-none text-2xl font-bold">{urlParams.merchantCurrency}</label>
          <input
            className="px-2 w-[calc(340px-88px-88px)] font-bold text-center text-2xl outline-none bg-transparent focus:placeholder:invisible placeholder:font-medium placeholder:text-xl"
            type="number"
            inputMode="decimal"
            onChange={(e) => {
              setCurrencyAmount(e.currentTarget.value);
              setShowNetwork(true);
            }}
            onBlur={() => {
              document.getElementById("inpersonCurrencyAmountBox")?.classList.add("bg-gray-100");
            }}
            onFocus={() => {
              document.getElementById("inpersonCurrencyAmountBox")?.classList.remove("bg-gray-100");
            }}
            placeholder="Enter Amount"
          ></input>
          <div className={`${isGettingBalance ? "invisible" : ""} w-[88px] tracking-tight border-l-2 border-transparent flex-none flex-flex-col`}>
            <div className="w-full text-sm font-medium text-gray-400">Your Balance</div>
            <div className="w-full text-sm font-medium text-gray-400">{USDCBalance} USDC</div>
          </div>
        </div>

        {/*---select network---*/}
        <div className={`${showNetwork ? "" : "invisible"} w-[340px] mt-6 flex justify-between items-center`}>
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
        </div>
      </div>

      {/*---AMOUNT SENT + FXRATES---*/}
      <div className={`${selectedNetwork ? "" : "invisible"} flex flex-col items-center w-[352px]`}>
        {/*---amount sent---*/}
        <div className="flex text-2xl leading-none font-bold text-center">
          {((Number(currencyAmount) * 0.98) / u2local[selectedToken]).toFixed(2)} {selectedToken} will be sent
        </div>

        <div className="mt-4 w-[340px] flex justify-between text-sm text-gray-400 font-medium leading-tight tracking-tighter">
          <div className="flex items-center group relative">
            <div className="flex flex-col items-center text-center mr-1">
              <div>FX Savings</div>
              {Number(u2local[selectedToken]) >= Number(u2local.USD) ? (
                <div className="font-bold text-green-500">+{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
              ) : (
                <div className="font-bold text-red-500">{((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)}%</div>
              )}
              {/*--- tooltip: fx rates ---*/}
              <div className="invisible group-hover:visible absolute bottom-[calc(100%+2px)] left-0 w-[236px] bg-white border border-gray-300 drop-shadow-sm px-3 py-2 rounded-md text-start">
                {urlParams.merchantCurrency === "USD" ? null : (
                  <div className="text-base leading-snug text-gray-800">
                    <p>
                      Your Rate: 1 {selectedToken} &#8652; {u2local[selectedToken]} {urlParams.merchantCurrency}
                    </p>
                    <p>
                      Bank Rate: 1 USD &#8652; {u2local.USD} {urlParams.merchantCurrency}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="italic bg-gray-300 rounded-full flex-none w-[16px] h-[16px] text-white flex justify-center items-center pb-[1px] pr-[1px]">i</div>
          </div>

          {/*--- instant cashback ---*/}
          <div className="flex items-center group relative">
            <div className="flex flex-col items-center text-center mr-1">
              <p>Instant Cashback</p>
              <p className="font-bold text-green-500">+2%</p>
              {/*--- tooltip: instant cashback ---*/}
              <div className="invisible group-hover:visible absolute bottom-[calc(100%+2px)] left-[30px] w-[188px] text-base leading-snug text-gray-800 bg-white border border-gray-300 px-3 py-2 rounded-md text-start">
                The value of USDC sent is 2% less than the value of the payment amount
              </div>
            </div>
            <div className="italic bg-gray-300 rounded-full flex-none w-[16px] h-[16px] text-white flex justify-center items-center pb-[1px] pr-[1px]">i</div>
          </div>

          {/*--- total savings ---*/}
          <div className="flex flex-col items-center text-center">
            <p>You Save</p>
            <div>
              {Number(u2local[selectedToken]) >= Number(u2local.USD) ? (
                <div className="font-bold text-green-500">+{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
              ) : (
                <div className="font-bold text-red-500">{Number(((u2local[selectedToken] / u2local.USD - 1) * 100).toFixed(1)) + 2}%</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*---SEND BUTTON---*/}
      <div className={`${selectedNetwork ? "" : "invisible"} mb-4 flex justify-center w-full`}>
        <button onClick={send} className="w-[300px] my-2 py-5 text-white text-xl font-bold bg-blue-500 hover:bg-blue-600 active:bg-blue-300 rounded-full drop-shadow-md">
          SEND
        </button>
      </div>
    </div>
  );
};

export default Inperson;
