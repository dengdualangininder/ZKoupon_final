const ErrorModal = ({ errorMsg, setIntroErrorModal }: { errorMsg: any; setIntroErrorModal: any }) => {
  return (
    <div>
      <div className="modal dark:bg-white dark:border-light5">
        {/*---content---*/}
        <div className="modalContent">{errorMsg}</div>
        {/*---button---*/}
        <div className="modalButtonContainer">
          <button onClick={() => setIntroErrorModal(false)} className="buttonSecondary">
            Dismiss
          </button>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ErrorModal;
