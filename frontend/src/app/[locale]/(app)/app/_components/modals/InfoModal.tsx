import { useTranslations } from "next-intl";

export default function InstructionsModal({ infoModal, setInfoModal }: { infoModal: string; setInfoModal: any }) {
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");

  return (
    <div>
      <div className="infoModal">
        <div className="infoModalContentContainer">
          {/*--- title ---*/}
          <p className="modalHeaderFont pb-[24px]">
            {infoModal == "employeePassword" && t("info.employeePass.title")}
            {infoModal == "cashback" && t("info.cashback.title")}
            {infoModal == "googleId" && t("info.google.title")}
            {infoModal == "cexDepositAddress" && t("info.platformAddress.title")}
          </p>
          {/*--- text ---*/}
          {infoModal == "employeePassword" && (
            <div className="space-y-3">
              <p>
                {t.rich("info.employeePass.text-1", {
                  span1: (chunks) => <span className="font-bold">{chunks}</span>,
                })}
              </p>
              <p className="pt-2 font-bold">{t("info.employeePass.text-2")}</p>
              <p className="">{t("info.employeePass.text-3")}</p>
            </div>
          )}
          {infoModal == "cashback" && (
            <div className="space-y-3">
              <p>{t("info.cashback.text-1")}</p>
              <p>{t("info.cashback.text-2")}</p>
              <p>{t("info.cashback.text-3")}</p>
            </div>
          )}
          {infoModal == "googleId" && <div>{t("info.google.text-1")}</div>}
          {infoModal == "cexDepositAddress" && <div>{t("info.platformAddress.text-1")}</div>}
          {/*---button---*/}
          <div className="modalButtonContainer">
            <button onClick={() => setInfoModal(null)} className="appButton1 modalButtonWidth">
              {tcommon("close")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setInfoModal(null)}></div>
    </div>
  );
}
