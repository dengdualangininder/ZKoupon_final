import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Hero({ merchantCurrency }: { merchantCurrency: string }) {
  // hooks
  const router = useRouter();
  const t = useTranslations("HomePage.Hero");

  // max-h-1180px to fit iPad Air in portrait
  return (
    <div id="hero" className="h-screen min-h-[520px] flex flex-col lg:justify-center">
      {/*--- navbar spacer ---*/}
      <div className="h-[84px]"></div>
      {/*--- container ---*/}
      <div className="flex-1 flex flex-col justify-center">
        <div className="landscape:pb-[180px] portrait:pb-[calc((100vh-84px)*3/10+30px)] landscape:lg:pb-[15%] flex flex-col items-center portrait:space-y-8 landscape:space-y-3 portrait:sm:space-y-14 landscape:lg:space-y-14">
          {/*--- header ---*/}
          <div className="text-4xl leading-[3rem] xs:text-[2.75rem] sm:text-5xl sm:leading-[4rem] lg:text-[4rem] lg:leading-tight font-extrabold text-center">
            {t("title1")}
            <br />
            {t("title2")}
          </div>
          {/*--- body ---*/}
          <div className="relative w-[97%] xs:w-[94%] max-w-[372px] xs:max-w-[600px] lg:w-[800px] lg:max-w-none homeTextLg">
            {t("subtitle1")}
            <span className="group">
              <span className="linkLight font-semibold">{t("trueP2P")}</span>
              <div className="w-full left-0 bottom-[calc(100%+4px)] heroTooltip">{merchantCurrency == "USD" ? t("tooltip1") : t("tooltip2")}</div>
            </span>
            {t("subtitle2")}
          </div>
          {/*--- button ---*/}
          <div className="hidden lg:flex w-full flex-col items-center">
            <button className={`heroButton`} onClick={() => router.push("/app")}>
              {t("enterApp")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
