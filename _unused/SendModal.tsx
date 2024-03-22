"use client";
import SendMAX from "../exchanges/SendMAX.jsx";
import SendCoinbase from "../exchanges/SendCoinbase.jsx";
import SendDefault from "../exchanges/SendDefault.jsx";
import sendModal1 from "../../assets/sendModal1.png";
import sendModal2 from "../../assets/sendModal2.png";
import sendModal3 from "../../assets/sendModal3.png";
import sendModal4 from "../../assets/sendModal4.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faArrowCircleDown } from "@fortawesome/free-solid-svg-icons";

const SendModal = ({ setSendModal, CEX }) => {
  return (
    <div>
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setSendModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How to send stablecoins from MetaMask to your cryptocurrency exchange</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            {/*---header---*/}
            <div className="flex justify-center mb-4">
              Your cryptocurrency exchange: <span className="ml-2">{CEX}</span>
            </div>
            {/*---text---*/}
            <div className="flex flex-col">
              {/*---1---*/}
              {CEX === "Coinbase Exchange" && <SendCoinbase />}
              {CEX === "MAX Exchange" && <SendMAX />}
              {CEX != "Coinbase Exchange" && CEX != "MAX Exchange" && <SendDefault />}

              {/*---2---*/}
              <div className="py-3 flex border-t">
                <div className="mr-3">2.</div>
                <div className="flex flex-col">
                  <div>In MetaMask, send the stablecoins to your cryptocurrency exchange:</div>
                  <div className="flex flex-col items-center">
                    <img src={sendModal1} className="mt-2 w-[220px] rounded-2xl border border-slate-300" />
                    <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
                    <img src={sendModal2} className="w-[220px] rounded-xl border border-slate-300" />
                    <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
                    <img src={sendModal3} className="w-[220px] rounded-xl border border-slate-300" />
                    <FontAwesomeIcon icon={faArrowCircleDown} className="my-1 text-blue-700 text-2xl" />
                    <img src={sendModal4} className="mb-1 w-[220px] rounded-xl border border-slate-300" />
                  </div>
                  <div>Wait 5-10 minutes for the stablecoins to show up in your cryptocurrency exchange.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modalBlackout"></div>
    </div>
  );
};

export default SendModal;
