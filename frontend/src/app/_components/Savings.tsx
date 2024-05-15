import { useState } from "react";

const Savings = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(20000);
  const [dailyTxn, setDailyTxn] = useState(100);
  const [feePercentage, setFeePercentage] = useState(0.027);
  const [feePerTxn, setFeePerTxn] = useState(0.1);

  return (
    <div className="w-[88%] h-full flex flex-col items-center">
      <div className="h-[85%] sm:h-[80%] text-xl flex flex-col justify-center">
        <div className="text-2xl leading-[36px]">
          <p className=""></p>
          <p className="mt-4">
            <span className="font-bold">Flash charges 0% fees.</span> Estimate your savings over credit cards below:
          </p>
        </div>
        <div className="mt-8 p-4 border-2 rounded-2xl text-lg">
          <div className="text-lg leading-tight">
            <div className="flex items-center">
              <label className="w-full">Your Avg. Monthly Revenue</label>
              <span className=" text-2xl">$</span>
              <input placeholder="20000" className="ml-1 text-2xl px-1 w-[108px] h-[52px] border border-gray-300 rounded-[4px]"></input>
            </div>
            <div className="mt-2 flex items-center">
              <label className="w-full">Your Avg. Daily Transaction Count</label>
              <input placeholder="100" className="ml-1 text-2xl px-2 w-[108px] h-[52px] border border-gray-300 rounded-[4px]"></input>
            </div>
          </div>
          <div className="mt-6 text-lg">
            Based on a credit card fee of 2.7% + $0.10 per transaction, you will save{" "}
            <span className="font-bold">${(monthlyRevenue * feePercentage + feePerTxn * dailyTxn).toFixed(2)}</span> per month
          </div>
        </div>
      </div>
    </div>
  );
};

export default Savings;
