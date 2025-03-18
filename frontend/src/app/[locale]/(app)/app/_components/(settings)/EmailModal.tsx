import { FaAngleLeft, FaCircleCheck } from "react-icons/fa6";
import { ImSpinner2 } from "react-icons/im";
import { useTranslations } from "next-intl";

export default function EmailModal({
  email,
  setEmail,
  setEmailModal,
  emailQrCode,
  isSendingEmail,
}: {
  email: string;
  setEmail: any;
  setEmailModal: any;
  emailQrCode: any;
  isSendingEmail: string;
}) {
  // hooks
  const t = useTranslations("App.Settings");

  // states

  return (
    <div className="z-[20]">
      <div className="transferModal z-[22]">
        <div className="w-full flex flex-col items-center">
          {isSendingEmail != "sending" && (
            <>
              {/*--- tablet/desktop close ---*/}
              <div className="xButtonContainer" onClick={() => setEmailModal(false)}>
                <div className="xButton">&#10005;</div>
              </div>
              {/*--- mobile back ---*/}
              <FaAngleLeft className="mobileBack" onClick={() => setEmailModal(false)} />
            </>
          )}
          {/*--- header ---*/}
          <div className="fullModalHeader">{t("emailModal.title")}</div>

          {/*---content---*/}
          <div className="transferModalContentContainer items-start">
            <div className="mt-[32px]">{t("emailModal.text")}</div>
            <label className="mt-[32px] w-full font-semibold">{t("emailModal.label")}</label>
            <div className="mt-[4px] w-full flex items-center relative">
              <input
                className="text-[18px] portrait:sm:text-[20px] landscape:lg:text-[20px] desktop:!text-[18px] peer w-full h-[56px] landscape:xl:desktop:h-[44px] px-[12px] focus:cursor-text rounded-md outline-none bg-transparent dark:focus:bg-dark3 border border-slate-300 focus:border-blue-500 focus:dark:border-slate-500 transition-all duration-[300ms] placeholder:text-slate-400 placeholder:dark:text-slate-600 placeholder:font-normal placeholder:italic"
                onChange={(e) => setEmail(e.currentTarget.value)}
                value={email}
                placeholder="Enter an email address"
              />
              {email && (
                <div className="absolute w-[28px] h-[28px] right-2 cursor-pointer desktop:hover:text-slate-500 peer-focus:hidden" onClick={() => setEmail("")}>
                  &#10005;
                </div>
              )}
            </div>
            {/*---button---*/}
            <div className="w-full pt-[50px] pb-[16px] flex justify-center items-center">
              {isSendingEmail == "initial" && (
                <button onClick={emailQrCode} className="appButton1 w-full">
                  {t("emailModal.button")}
                </button>
              )}
              {isSendingEmail == "sending" && (
                <div onClick={emailQrCode} className="appButton1 bg-lightButtonHover dark:bg-darkButtonHover w-full flex justify-center items-center">
                  <ImSpinner2 className="animate-spin text-[28px] text-slate-300" />
                  <div className="ml-[12px] textBaseApp">{t("emailModal.sending")}...</div>
                </div>
              )}
              {isSendingEmail == "sent" && (
                <div onClick={emailQrCode} className="appButton1 !bg-transparent border-none flex items-center justify-center">
                  <FaCircleCheck className="text-green-500 text-[24px]" />
                  <div className="ml-[12px]">{t("emailModal.sent")}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout z-[21]"></div>
    </div>
  );
}
