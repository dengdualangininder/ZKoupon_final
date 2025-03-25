//next
import { useState } from "react";
// types
import { Rates } from "@/utils/types";
import { currency2decimal, currency2symbol, currency2bank } from "@/utils/constants";
import { FaCircleInfo } from "react-icons/fa6";

export default function Inperson({
  urlParams,
  currencyAmount,
  setCurrencyAmount,
  currencyAmountAfterCashback,
  setCurrencyAmountAfterCashback,
  selectedToken,
  rates,
  send,
  fxSavings,
  tokenAmount,
  setTokenAmount,
}: {
  urlParams: any;
  currencyAmount: string;
  setCurrencyAmount: any;
  currencyAmountAfterCashback: string;
  setCurrencyAmountAfterCashback: any;
  selectedToken: string;
  rates: Rates;
  send: any;
  fxSavings: string | undefined;
  tokenAmount: string;
  setTokenAmount: any;
}) {
  const [digits, setDigits] = useState(4);

  return (
    <div className="w-[356px] h-full min-h-[480px] max-h-[540px] flex flex-col items-center justify-between">
      {/*---blank---*/}
      <div></div>
      {/*---Pay To---*/}
      <div className="text-center">
        <div className="text-lg font-bold text-slate-500">PAY TO</div>
        <div className="mt-2 text-2xl font-semibold line-clamp-1">{urlParams.merchantName}</div>
      </div>

      {/*--- AMOUNT BOX ---*/}
      <div className="flex flex-col items-center">
        <div className="mb-4 flex justify-center items-center relative">
          <div className="w-full h-[2px] bg-slate-300 absolute top-[calc(100%)]"></div>
          <div className={`${urlParams.merchantCurrency == "TWD" ? "text-3xl bottom-2 font-semibold" : "text-5xl"} absolute right-[calc(100%+12px)]`}>
            {currency2symbol[urlParams.merchantCurrency]}
          </div>
          <input
            id="payCurrencyAmount"
            className={`text-5xl font-medium p-0 text-center focus:placeholder:text-transparent bg-white outline-hidden focus:outline-hidden focus:ring-0 border-none focus:border-none placeholder:text-slate-400`}
            onChange={(e) => {
              setCurrencyAmount(e.currentTarget.value);
              const currencyAmountAfterCashbackTemp = (Number(e.currentTarget.value) * 0.98).toFixed(currency2decimal[urlParams.merchantCurrency]);
              setCurrencyAmountAfterCashback(currencyAmountAfterCashbackTemp);
              setTokenAmount((Number(currencyAmountAfterCashbackTemp) / rates.usdcToLocal).toFixed(2));
              setDigits(e.currentTarget.value.toString().length > 4 ? e.currentTarget.value.toString().length : 4);
              // setShowNetwork(true);
            }}
            type="number"
            inputMode="decimal"
            value={currencyAmount}
            placeholder={urlParams.merchantCurrency == "TWD" ? "0" : "0.00"}
            style={{ width: `${digits * (urlParams.merchantCurrency == "TWD" ? 32 : 28)}px` }}
            // step="0.01" // TODO: step is not working
          ></input>
        </div>
      </div>

      {/*--- USDC SENT + SAVINGS ---*/}
      <div className={`${currencyAmount ? "" : "invisible"} w-full flex flex-col items-center relative`}>
        {/*--- usdc sent ---*/}
        <div className={`${currencyAmount ? "" : "invisible"} text-2xl font-medium`}>
          {tokenAmount} {selectedToken} will be sent
        </div>
        {/*--- savings ---*/}
        <div className="mt-[8px] w-[80%] flex flex-col text-base text-slate-500 font-medium">
          {/*--- fx savings ---*/}
          {urlParams.merchantCurrency != "USD" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center group">
                FX Savings <FaCircleInfo className="ml-[6px] text-[16px] text-slate-400" />
                {/*--- tooltip ---*/}
                <div className="w-full bottom-[calc(100%+2px)] left-0 tooltip">
                  <p>
                    Your rate: 1 {selectedToken} &rarr; {rates.usdcToLocal} {urlParams.merchantCurrency}
                  </p>
                  <p>
                    {currency2bank[urlParams.merchantCurrency]} rate: 1 USD &rarr; {rates.usdToLocal} {urlParams.merchantCurrency}
                  </p>
                </div>
              </div>
              <div className="text-green-500 text-[18px]">{fxSavings}%</div>
            </div>
          )}
          {/*--- instant cashback ---*/}
          <div className="flex items-center justify-between">
            <div className="flex items-center group">
              Instant Cashback <FaCircleInfo className="ml-[6px] text-[16px] text-slate-400" />
              {/*--- tooltip ---*/}
              <div className="w-full left-0 bottom-[calc(100%+2px)] tooltip">
                The amount of USDC sent will be 2% less than the value of the {urlParams.merchantCurrency} entered above
              </div>
            </div>
            <p className=" text-green-500 text-[18px]">2%</p>
          </div>
          {/*--- total savings ---*/}
          <div className="flex items-center justify-between">
            <p>You Save</p>
            <div className="text-green-500 text-[18px]">{2 + Number(fxSavings)}%</div>
          </div>
        </div>
      </div>

      {/*---SEND BUTTON---*/}
      <div className={`${currencyAmount ? "" : "invisible"} px-[12px] my-[24px] flex justify-center w-full`}>
        <button onClick={send} className="w-full h-[56px] font-semibold text-white bg-[#0376C9] active:brightness-[1.1] rounded-full text-xl">
          PAY
        </button>
      </div>
    </div>
  );
}
