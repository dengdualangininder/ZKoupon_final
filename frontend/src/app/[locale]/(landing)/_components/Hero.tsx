import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Hero({ merchantCurrency }: { merchantCurrency: string | undefined }) {
  const t = useTranslations("HomePage.Hero");

  return (
    <div id="hero" className="homeSectionSize h-screen min-h-[520px] flex flex-col lg:justify-center">
      {/*--- navbar spacer ---*/}
      <div className="h-[84px]"></div>
      {/*--- container ---*/}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="landscape:pb-[180px] portrait:pb-[calc((100vh-84px)*3/10+30px)] landscape:lg:pb-[11%] flex flex-col items-center portrait:space-y-8 landscape:space-y-3 portrait:sm:space-y-14 landscape:lg:space-y-14">
          {/*--- header ---*/}
          <h1 className="text-[2.875rem] leading-[3.375rem] sm:leading-[4rem] lg:text-[3.75rem] lg:leading-[4.625rem] font-extrabold text-center">
            {t("title1")}
            <br />
            {t("title2")}
          </h1>
          {/*--- body ---*/}
          <div className="pb-2 relative w-[97%] lg:w-[780px] lg:desktop:w-[728px] homeTextLg">
            {t("subtitle1")}
            <span className="group">
              <span className="linkLight font-semibold">{t("trueP2P")}</span>
              <div className="w-full left-0 bottom-[calc(100%+4px)] heroTooltip">{merchantCurrency == "USD" ? t("tooltip1") : t("tooltip2")}</div>
            </span>
            {t("subtitle2")}
          </div>
          {/*--- button ---*/}
          <Link className={`hidden heroButton lg:flex items-center justify-center`} href={"/app"}>
            {t("enterApp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
