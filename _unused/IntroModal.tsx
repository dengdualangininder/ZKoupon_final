import React from "react";

const IntroModal = () => {
  return (
    <div>
      {" "}
      {introModal && (
        <div>
          <div className="flex flex-col justify-evenly items-center w-[348px] h-[450px] bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            <div className="w-[242px] text-xl leading-relaxed">
              To get started, read the <span className="font-bold">Instructions</span> section that appears in front of you after you close this popup.
            </div>
            <div>
              <div className="text-center text-xl font-bold">Real humans helping you</div>
              <div className="mt-0.5 w-[290px] border border-slate-500 px-2 py-1.5 rounded-[4px] text-base leading-tight xs:leading-tight">
                If you are having any difficulty setting up, email contact@lingpay.io and one of our advisors will contact you within 24 hours to help you get started.
              </div>
            </div>

            {/*---close button---*/}
            <button
              onClick={onClickIntroModal}
              className="w-[290px] h-[56px] xs:h-[48px] bg-blue-500 lg:hover:bg-blue-600 active:bg-blue-300 rounded-[4px] text-white text-xl xs:text-lg font-bold tracking-wide"
            >
              CLOSE
            </button>
          </div>
          <div className="opacity-60 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
    </div>
  );
};

export default IntroModal;
