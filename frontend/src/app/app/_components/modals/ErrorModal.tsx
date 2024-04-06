const ErrorModal = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  return (
    <div>
      <div className="w-[320px] min-h-[300px] px-8 pt-10 pb-11 flex flex-col items-center bg-white rounded-3xl border border-gray-500 fixed top-[50%] left-[50%]translate-x-[-50%] translate-y-[-55%] z-[90]">
        {/*---content---*/}
        <div className="mb-8 grow flex flex-col justify-center text-lg md:text-base text-center">{errorMsg}</div>
        <button
          onClick={() => setErrorModal(false)}
          className="px-10 py-3 text-gray-400 text-lg font-bold tracking-wide bg-white lg:hover:bg-gray-100 active:bg-gray-100 rounded-full border border-gray-200 drop-shadow-md"
        >
          DISMISS
        </button>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ErrorModal;
