import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteCookieAction } from "@/utils/actions";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";

export default function EmployeePassModal({ setSignOutModal }: { setSignOutModal: any }) {
  const t = useTranslations("App.Payments");
  const tcommon = useTranslations("Common");

  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <div>
      <div className="errorModal h-[400px] desktop:h-[340px]">
        {/*---content---*/}
        <div className="errorModalContentContainer">
          {/*---text---*/}
          <div className="py-[40px]">{t("signOutModal")}</div>
          {/*---buttons---*/}
          {!loggingOut && (
            <div className="modalButtonContainer">
              <button
                onClick={async () => {
                  await deleteCookieAction("userJwt");
                  window.location.href = "/login"; // hard refresh on route
                }}
                className="appButton1 modalButtonWidth"
              >
                {tcommon("yes2")}
              </button>
              <button onClick={() => setSignOutModal(false)} className="appButton2 modalButtonWidth">
                {tcommon("no2")}
              </button>
            </div>
          )}

          {loggingOut && (
            <div className="mt-[40px] h-[100px]">
              <SpinningCircleGray />
            </div>
          )}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
