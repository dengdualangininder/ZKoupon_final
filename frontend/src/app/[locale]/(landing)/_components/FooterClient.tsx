"use client";
import { useTranslations } from "next-intl";

export default function FooterClient() {
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
    <>
      {navLinks.map((navLink, index) => (
        <div className="footerLink" id={navLink.id} key={index} onClick={onClickLink}>
          {navLink.title}
        </div>
      ))}
    </>
  );
}
