import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export default function Hero({ merchantCurrency }: { merchantCurrency: string }) {
  // hooks
  const router = useRouter();
  const t = useTranslations("HomePage.Hero");

  return (
    <div className="h-screen flex flex-col max-h-[1200px]">
      {/*--- navbar spacer ---*/}
      <div className="h-[92px] portrait:sm:h-[108px] landscape:lg:h-[108px]"></div>
      {/*--- container without navbar ---*/}
      <div className="flex-1">
        {/*--- header + subheader ---*/}
        <div className="h-[75%] max-h-[800px] flex flex-col justify-center items-center">
          {/*--- header ---*/}
          <div className="font-extrabold text-center text-4xl portrait:sm:text-7xl landscape:lg:text-7xl leading-snug portrait:sm:leading-tight landscape:lg:leading-tight">
            {t("title1")}
            <br />
            {t("title2")}
          </div>
          {/*--- spacer ---*/}
          <div className="h-[8%]"></div>
          {/*--- subheader ---*/}
          <div className="relative heroSubheaderWidth heroSubheaderFont">
            {t("subtitle1")}
            <span className="group">
              <span className="link font-semibold">{t("trueP2P")}</span>
              <div className="invisible group-hover:visible w-full absolute left-0 bottom-[calc(100%+4px)] text-lg portrait:sm:text-xl landscape:lg:text-xl landscape:xl:desktop:text-base px-4 py-3 bg-slate-700 text-white rounded-xl border border-black z-[1]">
                {t("tooltip1", { merchantCurrency: merchantCurrency })} {merchantCurrency != "USD" && t("tooltip2", { merchantCurrency: merchantCurrency })}
              </div>
            </span>
            {t("subtitle2")}
          </div>
        </div>
        {/*--- enter button ---*/}
        <div className="hidden lg:flex w-full flex-col items-center">
          <button className={`heroButton`} onClick={() => router.push("/app")}>
            {t("enterApp")}
          </button>
        </div>
      </div>
    </div>
  );
}
