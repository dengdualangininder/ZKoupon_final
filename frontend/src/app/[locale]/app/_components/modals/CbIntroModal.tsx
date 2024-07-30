import { useTranslations } from "next-intl";

const cbIntroModal = ({ setCbIntroModal, setCashbackModal }: { setCbIntroModal: any; setCashbackModal: any }) => {
  const t = useTranslations("App.CbIntroModal");

  return (
    <div>
      <div className="cbIntroModal">
        <div className="modalXpadding overflow-y-auto">
          {/*--- text ---*/}
          <div className="cashbackModalTextContainer leadig-normal text-start">
            <p>{t("text-1")}</p>
            <p>{t("text-2")}</p>
            <p>{t.rich("text-3", { span1: (chunks: any) => <span className="font-bold">{chunks}</span>, span2: (chunks: any) => <span className="font-bold">{chunks}</span> })}</p>
          </div>
          {/*--- button ---*/}
          <div className="modalButtonContainer">
            <button
              onClick={() => {
                setCbIntroModal(false);
                setCashbackModal(true);
              }}
              className="buttonPrimary"
            >
              {t("enterApp")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default cbIntroModal;
