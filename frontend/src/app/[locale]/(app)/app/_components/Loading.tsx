import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Loading() {
  const tcommon = useTranslations("Common");

  return (
    <div className="w-full h-screen flex justify-center bg-light2 overflow-y-auto">
      <div className="w-full mx-[16px] max-w-[450px] h-full min-h-[600px] max-h-[900px] my-auto">
        {/*--- welcome ---*/}
        <div className="w-full h-full flex flex-col items-center justify-center pb-[50px]">
          <Image src="/logoBlackNoBg.svg" width={220} height={55} alt="logo" priority />
          {/* loading */}
          <div className="w-full h-[272px] flex flex-col items-center">
            <Image src="/loading.svg" width={80} height={80} alt="loading" className="mt-[80px] animate-spin" />
            <div className="mt-4 font-medium textBaseApp text-slate-500">{tcommon("loading")}...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
