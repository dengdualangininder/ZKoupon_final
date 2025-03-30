import { useTranslations } from "next-intl";

export default function ErrorModal({ errorModal, setErrorModal }: { errorModal: React.ReactNode; setErrorModal: any }) {
  const tcommon = useTranslations("Common");

  return (
    <div className="z-200">
      <div className="errorModalLight">
        <div className="errorModalContentContainer gap-[40px]">
          <div className="min-h-[80px]">{errorModal}</div>
          <button onClick={() => setErrorModal(null)} className="appButton1Light w-full">
            {tcommon("close")}
          </button>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
