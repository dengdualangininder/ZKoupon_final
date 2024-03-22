"use client";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
// import components
import DepositComponent from "../../components/DepositComponent.jsx";
import SpinningCircleGray from "../../components/svgs/SpinningCircleGray.jsx";

const DepositModal = ({ setDepositModal, merchantEmail, reload, setReload }) => {
  const [isGettingBalance, setIsGettingBalance] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [payModalMsg, setPayModalMsg] = useState("");
  const [isSendingComplete, setIsSendingComplete] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState();
  const [getBalanceTrigger, setGetBalanceTrigger] = useState(false);

  return (
    <div>
      <div className="w-[95%] sm:w-[430px] h-[88%] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[52%] sm:-translate-y-[48%] -translate-x-1/2 z-[20]">
        {/*---close button---*/}
        <button
          onClick={() => setDepositModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>

        {/*---Content---*/}
        <DepositComponent
          merchantEmail={merchantEmail}
          isGettingBalance={isGettingBalance}
          setIsGettingBalance={setIsGettingBalance}
          setPayModal={setPayModal}
          setPayModalMsg={setPayModalMsg}
          setIsSendingComplete={setIsSendingComplete}
          setErrorModal={setErrorModal}
          setErrorMsg={setErrorMsg}
          getBalanceTrigger={getBalanceTrigger}
        />
      </div>
      {/*---error modal---*/}
      {errorModal && (
        <div>
          <div className="px-6 py-8 flex justify-center bg-white w-[320px] h-[320px] rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[60]">
            {/*---container---*/}
            <div className="h-full w-full flex flex-col justify-between items-center text-lg leading-tight md:text-base md:leading-snug px-6">
              {/*---Error---*/}
              <div className="text-2xl font-bold text-slate-700 text-center">Error</div>
              {/*---msg---*/}
              <div className="mb-3 text-center text-lg">{errorMsg}</div>
              {/*---close button---*/}
              <button
                onClick={() => setErrorModal(false)}
                className="w-[160px] h-[56px] xs:h-[44px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-lg text-white text-lg font-bold tracking-wide"
              >
                DISMISS
              </button>
            </div>
          </div>
          <div className=" opacity-70 fixed inset-0 z-[50] bg-black"></div>
        </div>
      )}
      {/*---paid modal---*/}
      {payModal && (
        <div className="text-lg text-slate-700">
          <div className="w-[320px] h-[240px] px-6 py-8 bg-white border border-slate-500 rounded-xl fixed inset-1/2 -translate-y-1/2 -translate-x-1/2 z-[40]">
            {isSendingComplete ? (
              <div className="h-full flex flex-col justify-between items-center">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon className="text-[40px] text-green-500" icon={faCircleCheck} />
                  <div className="mt-2 text-xl font-bold text-center">Deposit Completed</div>
                </div>
                <div className="text-center"></div>
                <button
                  onClick={() => {
                    setPayModal(false);
                    setIsSendingComplete(false);
                    setReload(!reload);
                    setGetBalanceTrigger(!getBalanceTrigger);
                  }}
                  className="mt-4 w-[160px] h-[56px] xs:h-[44px] text-white bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 font-bold text-lg rounded-lg tracking-wide"
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center">
                <SpinningCircleGray />
                <div className="mt-4 text-center">{payModalMsg}</div>
              </div>
            )}
          </div>
          <div className="opacity-50 fixed inset-0 bg-black z-[30]"></div>
        </div>
      )}
      <div className="modalBlackout"></div>
    </div>
  );
};

export default DepositModal;
