import Image from "next/image";
import { useWeb3AuthInfo } from "../../Web3AuthProvider";
import { useTranslations } from "next-intl";

export default function Navbar({ selectedMenu, setSelectedMenu, setSignOutModal }: { selectedMenu: string; setSelectedMenu: any; setSignOutModal: any }) {
  const web3AuthInfo = useWeb3AuthInfo();
  const t = useTranslations("App.Page");

  const menus = [
    { id: "payments", title: t("payments"), imgBlack: "/paymentsBlack.svg" },
    { id: "cashout", title: t("cashout"), imgBlack: "/cashOutBlack.svg", modal: "cashoutIntroModal" },
    { id: "settings", title: t("settings"), imgBlack: "/settingsBlack.svg" },
  ];

  return (
    <div className="appNavColor fixed landscape:w-[120px] landscape:lg:w-[160px] landscape:desktop:w-[200px]! landscape:h-screen portrait:w-full portrait:h-[80px] portrait:sm:h-[140px] portrait:desktop:h-[140px]! flex justify-center items-center z-1">
      <div className="w-full h-full flex landscape:flex-col items-center justify-around landscape:lg:max-h-[640px] desktop:max-h-[500px]! portrait:portrait:px-[4px] portrait:max-w-[650px] portrait:pb-[15px]">
        {web3AuthInfo &&
          menus.map((menu) => (
            <div
              className={`${
                selectedMenu == menu.id ? "filterBlack dark:filterWhite" : "filterGray"
              } desktop:hover:filterBlack dark:desktop:hover:filterWhite flex flex-col items-center justify-center cursor-pointer`}
              key={menu.id}
              onClick={async () => setSelectedMenu(menu.id)}
            >
              {/*--- icon ---*/}
              <div className="relative w-[20px] h-[20px] portrait:sm:w-[28px] portrait:sm:h-[28px] landscape:lg:w-[28px] landscape:lg:h-[28px]">
                <Image src={menu.imgBlack} alt={menu.id} fill />
              </div>
              {/*--- text ---*/}
              <p className="text-sm portrait:sm:text-xl landscape:lg:text-xl desktop:text-base! font-semibold select-none text-black">{menu.title}</p>
            </div>
          ))}

        {!web3AuthInfo && (
          <div className="link" onClick={() => setSignOutModal(true)}>
            Sign Out
          </div>
        )}
      </div>
    </div>
  );
}
