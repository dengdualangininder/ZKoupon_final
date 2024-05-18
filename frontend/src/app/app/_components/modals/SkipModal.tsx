const SkipModal = ({ setSkipModal, setPage }: { setSkipModal: any; setPage: any }) => {
  return (
    <div>
      <div className="w-[348px] px-5 portrait:sm:w-[420px] landscape:lg:w-[420px] min-h-[330px] py-10 portrait:sm:py-16 landscape:lg:py-16 space-y-10 portrait:sm:space-y-16 landscape:lg:space-y-16 portrait:sm:px-10 landscape:lg:px-10 text-xl portrait:sm:text-2xl landscape:lg:text-2xl leading-relaxed portrait:sm:leading-relaxed landscape:lg:leading-relaxed text-center flex flex-col items-center rounded-xl bg-white fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[90]">
        {/*---content---*/}
        <div className="grow flex flex-col justify-center">
          <div className="font-bold">Are you sure you want to skip?</div>
          <div className="mt-4">If you do, please link a Coinbase account at a later time.</div>
        </div>
        {/*---content---*/}
        <div className="w-full px-2 flex justify-between">
          <button
            onClick={() => setSkipModal(false)}
            className="w-[124px] h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-gray-700 bg-white border border-gray-700 rounded-[4px] lg:hover:opacity-50 active:opacity-50"
          >
            CONTINUE
          </button>
          <button
            onClick={() => setPage("app")}
            className="w-[124px] h-[56px] portrait:sm:h-[64px] landscape:lg:h-[64px] text-lg portrait:sm:text-xl landscape:lg:text-xl font-medium text-white bg-blue-500 border border-blue-500 rounded-[4px] lg:hover:opacity-50 active:opacity-50"
          >
            SKIP
          </button>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setSkipModal(false)}></div>
    </div>
  );
};

export default SkipModal;
