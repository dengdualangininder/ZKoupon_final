import { useTranslations } from "next-intl";

const ErrorModal = ({ errorModal, setErrorModal }: { errorModal: React.ReactNode; setErrorModal: any }) => {
  const tcommon = useTranslations("Common");

  return (
    <div className="z-[200]">
      <div className="errorModal">
        <div className="errorModalContentContainer">
          {/*---text---*/}
          <div className="py-[40px]">{errorModal}</div>
          {/*--- button ---*/}
          <div className="modalButtonContainer">
            <button onClick={() => setErrorModal(null)} className="buttonPrimary modalButtonWidth">
              {tcommon("close")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ErrorModal;
