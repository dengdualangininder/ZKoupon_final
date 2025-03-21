import Spinner from "@/utils/components/Spinner";

export default function SwitchLangModal() {
  return (
    <div>
      <div className="errorModal">
        {/*---content---*/}
        <div className="w-full modalXpaddingLg overflow-y-auto flex flex-col gap-[16px] pt-[16px] items-center">
          {/*---text---*/}
          <Spinner size={32} />
          <div className="py-[16px]">Switching language...</div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
