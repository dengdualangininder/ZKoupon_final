import Image from "next/image";
import { useTranslations } from "next-intl";

const Simple = () => {
  const t = useTranslations("HomePage.Simple");

  return (
    <div className="homeSectionSize flex flex-col items-center xl:flex-row xl:items-center xl:justify-between">
      {/*--- text (left) ---*/}
      <div className="w-full xl:w-[47%]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          {t("header-1")}
          <br />
          {t("header-2")}
        </div>
        {/*--- body ---*/}
        <div className="homeBodyFont mt-8 w-full xl:w-[480px] space-y-6">
          <p>{t("body-1")}</p>
          <p>{t.rich("body-2", { span: (chunks) => <span className="text-2xl">{chunks}</span> })}</p>
        </div>
      </div>
      {/*--- image (right) ---*/}
      <div className="mt-10 relative w-[356px] h-[calc(356px/1.5)] sm:w-[500px] sm:h-[calc(500px/1.5)] xl:desktop:w-[480px] xl:desktop:h-[calc(480px/1.5)] rounded-3xl overflow-hidden">
        <Image src="/pos.jpg" alt="pointOfSale" fill />
      </div>
    </div>
  );
};

export default Simple;
