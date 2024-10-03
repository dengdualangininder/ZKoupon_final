import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Simple() {
  const t = useTranslations("HomePage.Simple");

  return (
    <div className="pt-[80px] pb-[96px] homeSectionSize min-h-[650px] flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
      {/*--- LEFT ---*/}
      <div className="w-full lg:w-[50%]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          {t("header-1")}
          <br />
          {t("header-2")}
        </div>
        {/*--- body ---*/}
        <div className="homeTextLg mt-8 w-full space-y-6">
          <p>{t("body-1")}</p>
          <p>{t.rich("body-2", { span: (chunks) => <span className="text-blue-400">{chunks}</span> })}</p>
        </div>
      </div>
      {/*--- RIGHT ---*/}
      <div className="mt-10 lg:mt-0 w-full lg:w-[42%] flex items-center justify-center lg:justify-end">
        <div className="w-full aspect-[3/2] rounded-3xl overflow-hidden relative">
          <Image src="/pos.jpg" alt="Point-of-sale device" sizes={"480px"} fill />
        </div>
      </div>
    </div>
  );
}
