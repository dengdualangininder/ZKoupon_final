import { ImSpinner2 } from "react-icons/im";

export default function SwitchLangModal() {
  return (
    <div>
      <div className="errorModal">
        {/*---content---*/}
        <div className="w-full modalXpaddingLg overflow-y-auto flex flex-col gap-[16px] pt-[16px] items-center">
          {/*---text---*/}
          <ImSpinner2 className="animate-spin text-[32px]" />
          <div className="py-[16px]">Switching language...</div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
