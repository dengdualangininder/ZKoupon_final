import { useTranslations } from "next-intl";

export default function Support() {
  //hooks
  const t = useTranslations("HomePage.Support");

  return (
    <div className="py-[80px] homeSectionSize min-h-0 flex flex-col items-center">
      {/*---Header---*/}
      <div className="textHeaderHome">{t("header")}</div>
      {/*---Content---*/}
      <div className="mt-[40px] w-full max-w-[650px]">{t("body")}</div>
    </div>
  );
}
