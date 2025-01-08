import { useTranslations } from "next-intl";

const CashbackModal = ({ setCashbackModal }: { setCashbackModal: any }) => {
  const t = useTranslations("App.CashbackModal");
  const tcommon = useTranslations("Common");

  return (
    <div>
      <div className="infoModal">
        <div className="infoModalContentContainer">
          {/*--- text ---*/}
          <div className="space-y-[16px]">
            <p>{t("text-1")}</p>
            <p>{t("text-2")}</p>
            <p>{t("text-3")}</p>
            <p>{t("text-4")}</p>
            <p>{t("text-5")}</p>
            <p>{t("text-6")}</p>
          </div>
          {/*--- buttons ---*/}
          <div className="modalButtonContainer">
            <button
              onClick={() => {
                setCashbackModal(false);
                window.localStorage.removeItem("cashbackModal");
              }}
              className="buttonPrimary modalButtonWidth"
            >
              {tcommon("close")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default CashbackModal;
