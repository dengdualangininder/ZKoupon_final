import { FaAngleLeft } from "react-icons/fa6";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useTranslations } from "next-intl";
import { Filter } from "@/utils/types";
import { ModalState } from "@/utils/types";

export default function CalendarModal({
  calendarModal,
  setCalendarModal,
  tempFilter,
  setTempFilter,
  setErrorModal,
}: {
  calendarModal: ModalState;
  setCalendarModal: any;
  tempFilter: Filter;
  setTempFilter: any;
  setErrorModal: any;
}) {
  const t = useTranslations("App.Payments");

  function closeModal() {
    setCalendarModal({ render: true, show: false });
    setTimeout(() => setCalendarModal({ render: false, show: false }), 500);
  }

  return (
    <div className={`${calendarModal.show ? "animate-slideIn" : "animate-slideOut"} sidebarModal z-[21]`}>
      {/*--- mobile back ---*/}
      <FaAngleLeft
        className="mobileBack"
        onClick={() => {
          setTempFilter({ ...tempFilter, searchDate: undefined });
          closeModal();
        }}
      />
      {/*--- tablet/desktop close ---*/}
      <div
        className="xButtonContainer rounded-tr-none"
        onClick={() => {
          setTempFilter({ ...tempFilter, searchDate: undefined });
          closeModal();
        }}
      >
        <div className="xButton">&#10005;</div>
      </div>
      {/*--- header ---*/}
      <div className="modalHeader">{t("searchModal.selectDatesCap")}</div>

      {/*--- content ---*/}
      <div className="sidebarModalContentContainer overflow-hidden">
        <div className="w-full">
          {/*--- calendar ---*/}
          <DayPicker
            className=""
            classNames={{
              cell: "w-[43px] h-[56px] portrait:sm:w-[52px] landscape:lg:w-[52px] desktop:w-[40px] desktop:h-[40px] align-middle text-center border-0 px-0",
              day: "w-[43px] h-[43px] desktop:w-[40px] desktop:h-[40px] inline-flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-500 hover:text-gray-900 font-normal aria-selected:opacity-100 cursor-pointer",
              day_today: "font-normal",
            }}
            mode="range"
            toDate={new Date()}
            selected={tempFilter?.searchDate}
            onSelect={(selected) => setTempFilter({ ...tempFilter, searchDate: selected })}
          />
        </div>
        {/*--- date range ---*/}
        <div className={`textBaseApp`}>
          {tempFilter?.searchDate?.from?.toLocaleDateString() ?? t("searchModal.startDate")}&nbsp; &ndash; &nbsp;
          {tempFilter?.searchDate?.to?.toLocaleDateString() ?? t("searchModal.endDate")}
        </div>
        {/*--- buttons ---*/}
        <div className="mt-[32px] mb-[48px] portrait:sm:mt-[48px] landscape:lg:mt-[48px] w-full flex justify-between">
          <button
            className="appButton2 w-[35%]"
            onClick={() => {
              setTempFilter({ ...tempFilter, searchDate: { from: undefined, to: undefined } });
            }}
          >
            {t("searchModal.clear")}
          </button>
          <button
            className="appButton1 w-[60%]"
            onClick={() => {
              if (tempFilter?.searchDate?.from && tempFilter?.searchDate?.to) {
                closeModal();
              } else {
                setErrorModal("Start date or end date missing");
              }
            }}
          >
            {t("searchModal.confirmDates")}
          </button>
        </div>
      </div>
    </div>
  );
}
