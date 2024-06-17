const SkipModal = ({ setSkipModal, setPage }: { setSkipModal: any; setPage: any }) => {
  return (
    <div>
      <div className="modal dark:bg-white text-black">
        {/*---content---*/}
        <div className="modalContent">
          <div className="">Setting up your Flash app only takes ~10 seconds. Are you sure you want to skip?</div>
        </div>
        {/*---content---*/}
        <div className="modalButtonContainer">
          <button onClick={() => setPage("app")} className="buttonPrimary dark:bg-black">
            SKIP
          </button>
          <button onClick={() => setSkipModal(false)} className="buttonSecondary">
            BACK
          </button>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setSkipModal(false)}></div>
    </div>
  );
};

export default SkipModal;
