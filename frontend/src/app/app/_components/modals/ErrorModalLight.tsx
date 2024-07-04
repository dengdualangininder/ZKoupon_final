const ErrorModalLight = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  return (
    <div className="z-[200]">
      <div className="errorModal dark:bg-white dark:border-light5 dark:text-black">
        {/*---content---*/}
        <div className="modalContent">{errorMsg}</div>
        {/*---button---*/}
        <div className="modalButtonContainer">
          <button onClick={() => setErrorModal(false)} className="buttonSecondary dark:desktop:hover:bg-light3 dark:active:bg-light4">
            Dismiss
          </button>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setErrorModal(false)}></div>
    </div>
  );
};

export default ErrorModalLight;
