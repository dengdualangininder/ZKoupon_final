import { useTranslations } from "next-intl";

const ErrorModal = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  const tcommon = useTranslations("Common");

  return (
    <div className="z-[200]">
      <div className="errorModal dark:bg-white dark:border-light5 dark:text-black">
        {/*--- content ---*/}
        <div className="modalXpaddingLg overflow-y-auto">
          {/*---text---*/}
          <div className="errorModalFont py-[16px]">{errorMsg}</div>
          {/*--- button ---*/}
          <div className="modalButtonContainer">
            <button onClick={() => setErrorModal(false)} className="buttonPrimaryLight sm:max-w-[300px]">
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
