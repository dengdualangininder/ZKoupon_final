import Image from "next/image";
// i18n
import { useTranslations } from "next-intl";
// components
import FooterClient from "./FooterClient";

export default function Footer() {
  //hooks
  const t = useTranslations("HomePage.Footer");

  return (
    <div className="py-[80px] homeSectionSize min-h-0 grid grid-cols-[140px_140px] md:grid-cols-[300px_140px_140px] gap-x-[20px] xs:gap-x-[90px] md:gap-[32px] gap-y-[80px] justify-center">
      <div className="flex flex-col items-center md:items-start md:justify-between gap-y-[24px] col-span-full order-last md:col-span-1 md:order-none">
        <Image src="logoWhiteNoBg.svg" width={150} height={80} alt="logo" className="" />
        <div className="text-sm lg:text-xs">&copy; 2024 Nulla Pay. All rights reserved.</div>
      </div>
      <div className="flex flex-col gap-[24px]">
        <div className="footerHeader">{t("company")}</div>
        <div className="footerLink">{t("about")}</div>
      </div>
      <div className="flex flex-col gap-[24px]">
        <div className="footerHeader">{t("links")}</div>
        <FooterClient />
      </div>
    </div>
  );
}
