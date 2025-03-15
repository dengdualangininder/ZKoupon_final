import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Hero({ merchantCurrency }: { merchantCurrency: string | undefined }) {
  const t = useTranslations("HomePage.Hero");

  return (
    <div id="hero" className="homeSectionSize h-screen min-h-[550px] max-h-[950px] flex flex-col justify-center items-center gap-[48px]">
      {/*--- header ---*/}
      <h1 className="text-[2.875rem] leading-[3.375rem] sm:leading-[4rem] lg:text-[3.75rem] lg:leading-[4.625rem] text-center font-extrabold">
        {t("title1")}
        <br />
        {t("title2")}
      </h1>
      {/*--- subheader ---*/}
      <div className="pb-[8px] relative w-full max-w-[670px]">
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
      <Link className={`invisible lg:visible homeButton`} href={"/app"}>
        {t("enterApp")}
      </Link>
    </div>
  );
}
