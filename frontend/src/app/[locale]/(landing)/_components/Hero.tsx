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
        <div className="landscape:pb-[180px] portrait:pb-[calc((100vh-84px)*3/10+30px)] landscape:lg:pb-[11%] flex flex-col items-center portrait:space-y-[32px] landscape:space-y-[12px] portrait:sm:space-y-[64px] landscape:lg:space-y-[64px] desktop:!space-y-[50px]">
          {/*--- header ---*/}
          <h1 className="text-[2.875rem] leading-[3.375rem] sm:leading-[4rem] lg:text-[3.75rem] lg:leading-[4.625rem] font-extrabold text-center">
            {t("title1")}
            <br />
            {t("title2")}
          </h1>
          {/*--- subheader ---*/}
          <div className="pb-[8px] relative w-[97%] max-w-[760px] desktop:max-w-[690px] text-xl desktop:text-lg">
            {t("subtitle1")}
            <span className="group">
              <span className="linkLight font-semibold">{t("trueP2P")}</span>
              <div className="w-full left-0 bottom-[calc(100%+4px)] heroTooltip">
                {merchantCurrency == "USD" ? t("tooltip1") : t.rich("tooltip2", { merchantCurrency: merchantCurrency })}
              </div>
            </span>
            {t("subtitle2")}
          </div>
          {/*--- button ---*/}
          <Link className={`hidden lg:flex heroButton`} href={"/app"}>
            {t("enterApp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
