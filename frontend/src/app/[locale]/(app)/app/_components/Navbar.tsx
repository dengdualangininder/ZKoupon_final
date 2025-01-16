import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { CashoutSettings } from "@/db/UserModel";
import { useW3Info } from "../../web3auth-provider";
import { useTranslations } from "next-intl";
import { FlashInfo } from "@/utils/types";

export default function Navbar({ menu, setMenu, flashInfo, cashoutSettings }: { menu: string; setMenu: any; flashInfo: FlashInfo; cashoutSettings: CashoutSettings }) {
  const w3Info = useW3Info();
  const router = useRouter();
  const t = useTranslations("App.Page");

  return (
    <div className="fixed flex-none landscape:w-[120px] landscape:lg:w-[160px] landscape:desktop:!w-[200px] landscape:h-screen portrait:w-full portrait:h-[80px] portrait:sm:h-[140px] portrait:desktop:!h-[140px] flex justify-center items-center bg-light1 dark:portrait:bg-gradient-to-t dark:landscape:bg-gradient-to-r dark:from-dark1 dark:via-dark2 dark:to-dark3 from-0% via-80% to-100% portrait:border-t landscape:border-r dark:!border-none border-light5 z-[1]">
      <div className="w-full h-full landscape:lg:h-[640px] desktop:!max-h-[500px] desktop:!min-h-[350px] portrait:pb-[10px] portrait:px-[4px] flex landscape:flex-col items-center justify-around">
        {[
          { id: "payments", title: t("payments"), imgBlack: "/paymentsBlack.svg" },
          { id: "cashout", title: t("cashout"), imgBlack: "/cashOutBlack.svg", modal: "cashoutIntroModal" },
          { id: "settings", title: t("settings"), imgBlack: "/settingsBlack.svg" },
        ].map((i) => (
          <div
            className={`cursor-pointer flex flex-col items-center justify-center ${
              menu == i.id ? "filterBlack dark:filterWhite" : "filterGray"
            } desktop:hover:filterBlack dark:desktop:hover:filterWhite`}
            id={i.id}
            key={i.id}
            onClick={async (e) => setMenu(e.currentTarget.id)}
          >
            <div className="relative w-[20px] h-[20px] portrait:sm:w-[28px] portrait:sm:h-[28px] landscape:lg:w-[28px] landscape:lg:h-[28px]">
              <Image src={i.imgBlack} alt={i.id} fill className="" />
            </div>
            <div className="menuText text-black">{i.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
