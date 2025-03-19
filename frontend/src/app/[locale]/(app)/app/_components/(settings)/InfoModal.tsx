import { useTranslations } from "next-intl";
import { FaAngleLeft } from "react-icons/fa6";

export default function InstructionsModal({ infoModal, setInfoModal }: { infoModal: string; setInfoModal: any }) {
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");

  return (
    <div>
      <div className="infoModal">
        {/*--- header ---*/}
        <div className="fullModalHeader">
          {infoModal == "employeePassword" && t("info.employeePass.title")}
          {infoModal == "cashback" && t("info.cashback.title")}
          {infoModal == "googleId" && t("info.google.title")}
          {infoModal == "cexDepositAddress" && t("info.platformAddress.title")}
        </div>
        {/*--- mobile back ---*/}
        <FaAngleLeft className="mobileBack" onClick={() => setInfoModal(false)} />
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer" onClick={() => setInfoModal(false)}>
          <div className="xButton">&#10005;</div>
        </div>

        <div className="fullModalContentContainer">
          <div className="fullModalContentContainer2 max-w-[600px]">
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
            {infoModal == "googleId" && (
              <div>
                {t.rich("info.google.text-1", {
                  a1: (chunks) => (
                    <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" className="link">
                      {chunks}
                    </a>
                  ),
                })}
              </div>
            )}
            {infoModal == "cexDepositAddress" && <div>{t("info.platformAddress.text-1")}</div>}
          </div>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setInfoModal(null)}></div>
    </div>
  );
}
