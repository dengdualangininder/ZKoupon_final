import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";

export default function NoUsdc() {
  const [showGetUsdc, setShowGetUsdc] = useState(false);

  return (
    <div className="mt-[32px] px-[12px] w-full h-full flex flex-col">
      <p>You need native USDC on the Polygon network for payment.</p>
      <div className="pt-[32px] text-blue-600 " onClick={() => setShowGetUsdc(!showGetUsdc)}>
        How to get USDC on Polygon? <span className="ml-[2px] inline-block align-middle">{showGetUsdc ? <FaMinus /> : <FaPlus />}</span>
      </div>
      <div className={`${showGetUsdc ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} grid [transition:opacity_400ms,grid_300ms] textBaseApp`}>
        <div className="overflow-hidden">
          <div className="pt-[8px]">To get USDC, sign up for a cryptocurrency exchange. Then, buy USDC and send USDC to your Metamask via the Polygon network.</div>
        </div>
      </div>
    </div>
  );
}
