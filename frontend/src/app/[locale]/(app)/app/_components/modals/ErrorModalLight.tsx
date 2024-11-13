import { useTranslations } from "next-intl";

const ErrorModal = ({ errorMsg, setErrorModal }: { errorMsg: any; setErrorModal: any }) => {
  const tcommon = useTranslations("Common");

  return (
    <div className="z-[200]">
      <div className="errorModal font-normal dark:bg-light2 dark:border-slate-500 dark:text-lightText1">
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
