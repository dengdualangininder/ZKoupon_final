import Image from "next/image";
import { useW3Info } from "../../Web3AuthProvider";
import { useTranslations } from "next-intl";

export default function Navbar({ menu, setMenu, setSignOutModal }: { menu: string; setMenu: any; setSignOutModal: any }) {
  const w3Info = useW3Info();
  const t = useTranslations("App.Page");

  const menuItems = [
    { id: "payments", title: t("payments"), imgBlack: "/paymentsBlack.svg" },
    { id: "cashout", title: t("cashout"), imgBlack: "/cashOutBlack.svg", modal: "cashoutIntroModal" },
    { id: "settings", title: t("settings"), imgBlack: "/settingsBlack.svg" },
  ];

  return (
    <div className="fixed flex-none landscape:w-[120px] landscape:lg:w-[160px] landscape:desktop:!w-[200px] landscape:h-screen portrait:w-full portrait:h-[80px] portrait:sm:h-[140px] portrait:desktop:!h-[140px] flex justify-center items-center bg-light1 dark:portrait:bg-gradient-to-t dark:landscape:bg-gradient-to-r dark:from-dark1 dark:via-dark2 dark:to-dark3 from-0% via-80% to-100% portrait:border-t landscape:border-r dark:!border-none border-light5 z-[1]">
      <div className="w-full h-full landscape:lg:h-[640px] desktop:!max-h-[500px] desktop:!min-h-[350px] portrait:pb-[10px] portrait:px-[4px] flex landscape:flex-col items-center justify-around">
        {w3Info &&
          menuItems.map((item) => (
            <div
              className={`${
                menu == item.id ? "filterBlack dark:filterWhite" : "filterGray"
              } desktop:hover:filterBlack dark:desktop:hover:filterWhite flex flex-col items-center justify-center cursor-pointer`}
              key={item.id}
              onClick={async () => setMenu(item.id)}
            >
              {/*--- icon ---*/}
              <div className="relative w-[20px] h-[20px] portrait:sm:w-[28px] portrait:sm:h-[28px] landscape:lg:w-[28px] landscape:lg:h-[28px]">
                <Image src={item.imgBlack} alt={item.id} fill />
              </div>
              {/*--- text ---*/}
              <p className="mt-[3px] text-[0.8125rem] leading-tight portrait:sm:text-xl landscape:lg:text-xl desktop:!text-base font-semibold select-none text-black">
                {item.title}
              </p>
            </div>
          ))}

        {!w3Info && (
          <div className="link" onClick={() => setSignOutModal(true)}>
            Sign Out
          </div>
        )}
      </div>
    </div>
  );
}
