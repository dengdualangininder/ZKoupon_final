import { useTranslations } from "next-intl";

export default function EmployeePassModal({ setEmployeePassModal, onClickChangeEmployeePass }: { setEmployeePassModal: any; onClickChangeEmployeePass: any }) {
  const t = useTranslations("App.Settings");

  return (
    <div>
      <div className="errorModal">
        {/*---content---*/}
        <div className="errorModalContentContainer">
          {/*---text---*/}
          <div className="py-[40px]">{t("employeePassModal.text")}</div>
          {/*---buttons---*/}
          <div className="modalButtonContainer">
            <button onClick={onClickChangeEmployeePass} className="appButton1 modalButtonWidth">
              {t("employeePassModal.change")}
            </button>
            <button onClick={() => setEmployeePassModal(false)} className="appButton2 modalButtonWidth">
              {t("employeePassModal.cancel")}
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
