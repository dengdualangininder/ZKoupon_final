const ErrorModal = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  return (
    <div>
      <div className="modal">
        {/*---content---*/}
        <div className="grow flex flex-col justify-center">{errorMsg}</div>
        {/*---button---*/}
        <button onClick={() => setErrorModal(false)} className="modalButtonWhite">
          Dismiss
        </button>
      </div>
      <div className="modalBlackout" onClick={() => setErrorModal(false)}></div>
    </div>
  );
};

export default ErrorModal;
