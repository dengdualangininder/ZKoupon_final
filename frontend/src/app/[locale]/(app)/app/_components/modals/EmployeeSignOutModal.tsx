import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteCookieAction } from "@/utils/actions";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import { useRouter } from "@/i18n/routing";

export default function EmployeeSignOutModal({ setSignOutModal }: { setSignOutModal: any }) {
  const t = useTranslations("App.Payments");
  const tcommon = useTranslations("Common");
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div>
      <div className="errorModal">
        <div className="errorModalContentContainer">
          <div className="py-[40px]">{t("signOutModal")}</div>
          {!loggingOut && (
            <div className="pt-[32px] w-full flex gap-[24px]">
              <button onClick={() => setSignOutModal(false)} className="appButton2 flex-1!">
                {tcommon("no2")}
              </button>
              <button
                onClick={async () => {
                  setLoggingOut(true);
                  await deleteCookieAction("userJwt");
                  window.location.href = "/login";
                }}
                className="appButton1 flex-1!"
              >
                {tcommon("yes2")}
              </button>
            </div>
          )}
          {loggingOut && (
            <div className="pt-[32px] w-full flex items-center justify-center appButtonHeight">
              <SpinningCircleGray />
            </div>
          )}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
