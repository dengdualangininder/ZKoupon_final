import { useTranslations } from "next-intl";

const CashbackModal = ({ setCashbackModal }: { setCashbackModal: any }) => {
  const t = useTranslations("App.CashbackModal");
  const tcommon = useTranslations("Common");

  return (
    <div>
      <div className="cashbackModal">
        <div className="modalXpadding overflow-y-auto ">
          {/*--- text ---*/}
          <div className="cashbackModalTextContainer leading-snug landscape:xl:desktop:leading-normal">
            <p>{t("text-1")}</p>
            <p>{t("text-2")}</p>
            <p>{t("text-3")}</p>
            <p>{t("text-4")}</p>
            <p>{t("text-5")}</p>
            <p>{t("text-6")}</p>
          </div>
          {/*--- buttons ---*/}
          <div className="modalButtonContainer">
            <button onClick={() => setCashbackModal(false)} className="buttonPrimary max-w-[400px]">
              {tcommon("close")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setCashbackModal(false)}></div>
    </div>
  );
};

export default CashbackModal;
