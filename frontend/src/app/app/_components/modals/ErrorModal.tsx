const ErrorModal = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  return (
    <div>
      <div className="modal">
        {/*---content---*/}
        <div className="mb-8 grow flex flex-col justify-center text-lg md:text-base text-center">{errorMsg}</div>
      </div>
      <div className="modalBlackout" onClick={() => setErrorModal(false)}></div>
    </div>
  );
};

export default ErrorModal;
