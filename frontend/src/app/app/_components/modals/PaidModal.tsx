"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const PaidModal = ({ setIsSendingComplete, currencyAmount, merchantName, merchantCurrency }) => {
  const clickDown = () => {
    document.getElementById("modalbg").classList.remove("bg-white");
    document.getElementById("modalbg").classList.add("bg-green-500");
  };
  const clickUp = () => {
    document.getElementById("modalbg").classList.remove("bg-green-500");
    document.getElementById("modalbg").classList.add("bg-white");
  };

  return (
    <div className="font-nunito">
      <div
        id="modalbg"
        className="w-[90%] h-[80%] bg-white rounded-xl border-2 border-gray-500 fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[10] overflow-hidden px-6"
        onPointerDown={clickDown}
        onPointerUp={clickUp}
      >
        <div className="h-full flex flex-col items-center justify-around text-gray-600">
          {/*---store name---*/}
          <div className="text-center text-xl relative">
            <div className="leading-none text-xl">PAYMENT TO</div>
            <div className="mt-1 text-2xl font-bold text-blue-500">{merchantName}</div>
            <div className="text-xl">COMPLETED</div>

            <FontAwesomeIcon className="absolute bottom-[-64px] left-[calc(50%-25px)] animate-blob2 text-[50px] text-green-500" icon={faCircleCheck} />
          </div>

          {/*---amount and time---*/}
          <div className="flex flex-col items-center bg-clip-text text-transparent bg-gradient-to-l from-gray-600 from-50% to-blue-400 animate-textTwo">
            <div className="mt-4 text-6xl flex items-center font-bold">
              {currencyAmount}
              <span className="ml-3 font-bold pt-0.5 text-2xl">{merchantCurrency}</span>
            </div>
            <div className="mt-4 font-bold text-4xl">{new Date().toLocaleString([], { timeStyle: "short" })}</div>
          </div>
          {/*---close---*/}
          <button onClick={() => setIsSendingComplete(false)} className=" text-white bg-green-500 hover:bg-green-600 font-bold px-10 py-4 text-xl rounded-md w-full">
            CLOSE
          </button>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 bg-black"></div>
    </div>
  );
};

export default PaidModal;
