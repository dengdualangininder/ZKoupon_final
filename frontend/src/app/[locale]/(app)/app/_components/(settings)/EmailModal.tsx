import { FaAngleLeft, FaCircleCheck } from "react-icons/fa6";
import { ImSpinner2 } from "react-icons/im";
import { useTranslations } from "next-intl";
import { setBlockTimestampInterval } from "viem/actions";

export default function EmailModal({
  email,
  setEmail,
  setEmailModal,
  emailQrCode,
  isSendingEmail,
  setIsSendingEmail,
}: {
  email: string;
  setEmail: any;
  setEmailModal: any;
  emailQrCode: any;
  isSendingEmail: string;
  setIsSendingEmail: any;
}) {
  // hooks
  const t = useTranslations("App.Settings");

  const close = () => {
    setEmailModal(false);
    setIsSendingEmail("initial");
  };

  return (
    <div className="">
      <div className="fullModal">
        <div className="w-full flex flex-col items-center">
          {isSendingEmail != "sending" && (
            <>
              {/*--- tablet/desktop close ---*/}
              <div className="xButtonContainer" onClick={close}>
                <div className="xButton">&#10005;</div>
              </div>
              {/*--- mobile back ---*/}
              <FaAngleLeft className="mobileBack" onClick={close} />
            </>
          )}
          {/*--- header ---*/}
          <div className="fullModalHeader">{t("emailModal.title")}</div>

          {/*---content---*/}
          <div className="fullModalContentContainer">
            <div className="fullModalContentContainer2 max-w-[480px] desktop:max-w-[430px]">
              <div className="mt-[32px]">{t("emailModal.text")}</div>
              <label className="mt-[32px] mb-[6px] textSmApp font-semibold">{t("emailModal.label")}</label>
              <div className="flex items-center relative">
                <input
                  className="textBaseApp inputColor w-full h-[60px] desktop:!h-[48px] px-[14px] desktop:px-[12px] peer"
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
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
