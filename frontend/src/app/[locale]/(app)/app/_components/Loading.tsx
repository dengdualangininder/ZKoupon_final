import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("App.Page");

  return (
    <div className="w-full h-screen flex justify-center overflow-y-auto bg-light1">
      <div className="w-[92%] max-w-[420px] h-screen min-h-[650px] my-auto max-h-[800px] relative">
        {/* LOADING */}
        <div className="w-full h-full absolute flex flex-col items-center justify-center">
          <div className="w-[340px] h-[60px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:desktop:h-[60px] animate-spin relative">
            <Image src="/loadingCircleBlack.svg" alt="loading icon" fill />
          </div>
          <div className="mt-4 font-medium text-slate-500">{t("loading")}...</div>
        </div>
        {/*--- welcome ---*/}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="pb-16 w-full flex flex-col items-center portrait:space-y-12 landscape:space-y-6 portrait:sm:space-y-24 landscape:lg:space-y-24 landscape:lg:desktop:space-y-16">
            <div className="relative w-[300px] h-[100px] landscape:lg:h-[100px] portrait:sm:h-[100px] landscape:lg:desktop:h-[100px] mr-1">
              <Image src="/logo.svg" alt="logo" fill priority />
            </div>
            <div className="text-xl pb-4 text-center animate-fadeInAnimation leading-relaxed invisible">
              Set up crypto payments
              <br />
              with 0% fees now
            </div>
            {/*--- buttons ---*/}
            <button className="invisible w-[240px] h-[60px] portrait:sm:h-[60px] landscape:lg:h-[60px] landscape:desktop:xl:h-[48px] text-lg portrait:sm:text-lg landscape:lg:text-base landscape:desktop:xl:text-base font-medium text-white bg-blue-500 border-2 border-blue-500 active:opacity-50 lg:hover:opacity-50 rounded-[4px] animate-fadeInAnimation">
              START &nbsp;&#10095;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
