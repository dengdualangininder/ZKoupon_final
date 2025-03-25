import { useState } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Filter } from "@/utils/types";
import { ModalState } from "@/utils/types";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

export default function SearchModal({
  searchModal,
  setSearchModal,
  setFilter,
  tempFilter,
  setTempFilter,
  setCalendarModal,
  setErrorModal,
  setClearSearchModal,
  clearFilter,
}: {
  searchModal: ModalState;
  setSearchModal: any;
  setFilter: any;
  tempFilter: Filter;
  setTempFilter: any;
  setCalendarModal: any;
  setErrorModal: any;
  setClearSearchModal: any;
  clearFilter: any;
}) {
  const t = useTranslations("App.Payments");
  const [showCalendar, setShowCalendar] = useState(false);
  const defaultClassNames = getDefaultClassNames();

  const search = async () => {
    // if no filters, show error
    if (!tempFilter.last4Chars && !tempFilter.refunded && !tempFilter.toRefund && !tempFilter.searchDate?.to) {
      setErrorModal("Please select a search criteria");
      return;
    }
    setFilter(tempFilter);
    setClearSearchModal(true);
    setSearchModal(false);
  };

  function closeModal() {
    setSearchModal({ render: true, show: false });
    setTimeout(() => setSearchModal({ render: false, show: false }), 500);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-10`}
        onClick={() => {
          closeModal();
          setCalendarModal({ render: true, show: false });
          setTimeout(() => setCalendarModal({ render: false, show: false }), 500);
        }}
      ></div>
      <div className={`${searchModal.show ? "animate-slideIn" : "animate-slideOut"} sidebarModal`}>
        {/*--- mobile back ---*/}
        <FaAngleLeft className="mobileBack" onClick={() => closeModal()} />
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer rounded-tr-none" onClick={() => closeModal()}>
          <div className="xButton">&#10005;</div>
        </div>

        {/*--- HEADER ---*/}
        <div className="fullModalHeader">{t("searchModal.title")}</div>

        {/*--- contents ---*/}
        <div className="sidebarModalContentContainer textBaseApp">
          {/*--- filter 1 - customer's address ---*/}
          <div className="searchModalCategoryContainer">
            <div className="">
              <div className="font-medium">{t("searchModal.customerAddress")}</div>
              <div className="text-base desktop:text-xs italic leading-none pb-[5px]">{t("searchModal.enterChars")}</div>
            </div>
            <input
              className="w-[104px] portrait:sm:w-[120px] landscape:lg:w-[120px] desktop:!w-[88px] appInputHeight textInputAppLg text-center inputColor"
              onChange={(e) => {
                setTempFilter({ ...tempFilter, last4Chars: e.currentTarget.value });
              }}
              value={tempFilter?.last4Chars}
              maxLength={4}
              placeholder="Af19"
            />
          </div>
          {/*--- filter 2 - "to refund" payments ---*/}
          <div className="searchModalCategoryContainer">
            <div className="font-medium">{t("searchModal.toRefund")}</div>
            <input
              type="checkbox"
              className="checkbox"
              onChange={(e) => setTempFilter({ ...tempFilter, toRefund: e.target.checked ? true : false })}
              checked={tempFilter?.toRefund}
            />
          </div>
          {/*--- filter 3 - refunded payments ---*/}
          <div className="searchModalCategoryContainer">
            <div className="font-medium">{t("searchModal.refunded")}</div>
            <input
              type="checkbox"
              className="checkbox"
              onChange={(e) => setTempFilter({ ...tempFilter, refunded: e.target.checked ? true : false })}
              checked={tempFilter?.refunded}
            />
          </div>
          {/*--- filter 4 - date ---*/}
          <div className="searchModalCategoryContainer border-none relative z-[11]">
            <div className="font-medium">{t("searchModal.date")}</div>
            <div className="relative">
              <div
                className={`${
                  tempFilter?.searchDate?.to ? "" : "italic text-slate-400 dark:text-zinc-700"
                } inputColor px-[12px] min-w-[110px] appInputHeight textBaseAppPx flex items-center justify-center cursor-pointer`}
                // onClick={() => setCalendarModal({ render: true, show: true })}
                onClick={() => setShowCalendar(true)}
              >
                {tempFilter?.searchDate?.to
                  ? `${tempFilter.searchDate.from?.toLocaleDateString()} - ${tempFilter.searchDate.to.toLocaleDateString()}`
                  : t("searchModal.selectDates")}
              </div>
              {showCalendar && (
                <>
                  <div className="absolute right-0 bottom-[100%] border border-slate-300 dark:border-dark4 rounded-[8px] bg-light1 dark:bg-dark1 z-[100]">
                    <DayPicker
                      className="textSmApp"
                      classNames={{
                        month_caption: `${defaultClassNames.month_caption} text-lg desktop:!text-base font-bold`,
                        nav: `${defaultClassNames.nav} gap-[4px]`,
                        button_previous: `${defaultClassNames.button_previous} w-[40px] h-[40px] desktop:w-[30px] desktop:h-[30px] border-[1.5px] border-slate-200 dark:border-slate-800 bg-none hover:bg-slate-200 dark:hover:bg-slate-700 slate-300 transition-all duration-300`,
                        button_next: `${defaultClassNames.button_next} w-[40px] h-[40px] desktop:w-[30px] desktop:h-[30px] border-[1.5px] border-slate-200 dark:border-slate-800 bg-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300`,
                        chevron: `${defaultClassNames.chevron} w-[16px] h-[16px] fill-lightText1 dark:fill-darkText1`,
                        weekday: "",
                        day: `${defaultClassNames.day} w-[44px] h-[44px] desktop:w-[30px] desktop:h-[30px] [&:not(.rdp-selected):hover]:bg-slate-200 dark:[&:not(.rdp-selected):hover]:bg-slate-700`,
                        day_button: `${defaultClassNames.day_button} w-[44px] h-[44px] desktop:w-[30px] desktop:h-[30px] cursor-pointer`,
                        selected: `${defaultClassNames.selected} bg-lightButton1Bg dark:bg-darkButton1Bg text-lightButton1Text dark:text-darkButton1Text`,
                        today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-slate-200 dark:[&:not(.rdp-selected)]:bg-slate-700`,
                      }}
                      mode="range"
                      endMonth={new Date()}
                      selected={tempFilter?.searchDate}
                      onSelect={(selected) => setTempFilter({ ...tempFilter, searchDate: selected })}
                      hideWeekdays={true}
                      fixedWeeks={true}
                    />
                  </div>
                  {showCalendar && <div className="fixed w-screen h-screen left-0 top-0 z-[99]" onClick={() => setShowCalendar(false)}></div>}
                </>
              )}
            </div>
          </div>
          {/*--- button 
          
                                  {
                          // root: `${defaultClassNames.root} p-[8px]`, // text-lightText1 dark:text-darkText1
                          // // nav_button: "inline-flex justify-center items-center absolute top-0 w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100",
                          // // nav_button: `inline-flex justify-center items-center w-[40px] h-[40px] rounded-md text-gray-600 hover:bg-gray-100`,
                          // // button_next: `${defaultClassNames.button_next} dark:text-darkButton`,
                          // // button_previous: `${defaultClassNames.button_previous} dark:text-darkButton`,
                          // chevron: "inline-block fill-darkButton",
                          // day: `w-[40px] h-[40px] portrait:sm:w-[52px] landscape:lg:w-[52px] desktop:!w-[30px] desktop:!h-[30px] rounded-[8px]`,
                          // day_button: `w-[40px] h-[40px] desktop:!w-[30px] desktop:!h-[30px] rounded-[8px] hover:bg-darkButton`,
                          // today: "font-bold",
                          // range_start: `rounded-l-[8px]`, // bg-darkButton hover:bg-darkButton aria-selected:hover:bg-none aria-selected:outline-none
                          // range_middle: `rounded-none`, // aria-selected:bg-darkButton font-normal
                          // range_end: `rounded-r-[8px]`, // bg-darkButton hover:bg-darkButton
                          // selected: `font-semibold bg-darkButton`,
                          // week_number: "",
                        }
          ---*/}
          <div className="mt-[40px] mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full grid grid-cols-[1fr_2fr] gap-[20px]">
            <button className="appButton2" onClick={clearFilter}>
              {t("searchModal.clear")}
            </button>
            <button className="appButton1" onClick={search}>
              {t("searchModal.search")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
