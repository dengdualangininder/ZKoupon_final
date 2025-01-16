import { FaCaretDown } from "react-icons/fa6";
import { SlGlobe } from "react-icons/sl";
import { langObjectArray } from "@/utils/constants";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export default function SelectLang({ langModal, setLangModal }: { langModal: boolean; setLangModal: any }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={`${langModal ? "bg-slate-250 rounded-b-none" : ""} h-full relative flex items-center p-[8px] gap-[4px] rounded-[6px] cursor-pointer desktop:hover:bg-slate-250`}
      onClick={() => setLangModal(!langModal)}
    >
      <SlGlobe className="w-[22px] h-[22px] desktop:w-[20px] desktop:h-[20px]" />
      <FaCaretDown className="w-[18px] h-[18px] desktop:w-[16px] desktop:h-[16px]" />
      {langModal && (
        <div className="absolute top-[calc(100%)] right-0 rounded-md rounded-tr-none p-[24px] space-y-[32px] bg-slate-250 z-[100]">
          {langObjectArray.map((langObject) => (
            <div
              key={langObject.id}
              className={`${
                langObject.id == locale ? "underline decoration-[1.5px] underline-offset-[6px]" : ""
              } desktop:hover:underline decoration-[1.5px] underline-offset-[6px] cursor-pointer`}
              onClick={() => router.replace(pathname, { locale: langObject.id })}
            >
              {langObject.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
