"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

const Footer = () => {
  //hooks
  const t = useTranslations("HomePage.Footer");

  const onClickLink = (e: any) => {
    document.getElementById(e.target.id.replace("FooterLink", ""))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navLinks = [
    {
      id: "HowFooterLink",
      title: t("how"),
    },
    {
      id: "LowCostFooterLink",
      title: t("why"),
    },
    {
      id: "LearnFooterLink",
      title: t("learn"),
    },
  ];

  return (
    <div className="py-[80px] homeSectionSize grid grid-cols-[140px_140px] md:grid-cols-[300px_140px_140px] gap-x-[20px] xs:gap-x-[90px] md:gap-[32px] gap-y-[80px] justify-center">
      <div className="flex flex-col items-center md:items-start md:justify-between space-y-6 col-span-full order-last md:col-span-1 md:order-none">
        <Image src="logoNoBg.svg" width={150} height={80} alt="Flash logo" className="" />
        <div className="text-sm lg:text-xs">&copy; 2024 Flash Payments. All rights reserved.</div>
      </div>
      <div className="flex flex-col space-y-6">
        <div className="footerHeader">{t("company")}</div>
        <div className="footerLink">{t("about")}</div>
      </div>
      <div className="flex flex-col space-y-6">
        <div className="footerHeader">{t("links")}</div>
        {navLinks.map((navLink, index) => (
          <div className="footerLink" id={navLink.id} key={index} onClick={onClickLink}>
            {navLink.title}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Footer;
