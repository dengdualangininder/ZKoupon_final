import { useState } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Filter } from "@/utils/types";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { motion } from "framer-motion";

export default function SearchModal({
  setSearchModal,
  setFilter,
  tempFilter,
  setTempFilter,
  setErrorModal,
  setClearSearchModal,
  clearFilter,
}: {
  setSearchModal: any;
  setFilter: any;
  tempFilter: Filter;
  setTempFilter: any;
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

  return (
    <>
      <div className={`fixed inset-0 z-10`} onClick={() => setSearchModal(false)}></div>
      <motion.aside className={`sidebarModal`} key="searchModal" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.3 }}>
        {/*--- mobile back ---*/}
        <FaAngleLeft className="mobileBack" onClick={() => setSearchModal(false)} />
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer rounded-tr-none" onClick={() => setSearchModal(false)}>
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
              className="w-[104px] portrait:sm:w-[120px] landscape:lg:w-[120px] desktop:w-[88px]! appInputHeight textInputAppLg text-center inputColor"
              onChange={(e) => {
                setTempFilter({ ...tempFilter, last4Chars: e.currentTarget.value });
              }}
              value={tempFilter?.last4Chars}
              maxLength={4}
              placeholder="empty"
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
          <div className="searchModalCategoryContainer border-none relative z-11">
            <div className="font-medium">{t("searchModal.date")}</div>
            <div className="relative">
              <button
                className={`${tempFilter?.searchDate?.to ? "" : "italic text-slate-400 dark:text-zinc-700"} inputColor ${
                  showCalendar ? "border-blue-500 dark:border-slate-600" : ""
                } px-[12px] min-w-[110px] appInputHeight textBaseAppPx flex items-center justify-center cursor-pointer z-[2] relative`}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {tempFilter?.searchDate?.to
                  ? `${tempFilter.searchDate.from?.toLocaleDateString()} - ${tempFilter.searchDate.to.toLocaleDateString()}`
                  : t("searchModal.selectDates")}
              </button>
              {showCalendar && (
                <>
                  <div className="absolute right-0 bottom-[calc(100%+8px)] px-[8px] py-[4px] border border-slate-300 dark:border-dark4 rounded-[8px] bg-light1 dark:bg-dark1 z-[2]">
                    <DayPicker
                      className="textSmApp"
                      classNames={{
                        month_caption: `${defaultClassNames.month_caption} textBaseApp font-bold select-none`,
                        nav: `${defaultClassNames.nav} px-[4px]`,
                        button_previous: `${defaultClassNames.button_previous} w-[36px] h-[36px] desktop:w-[32px] desktop:h-[32px] border-[1.5px] border-slate-200 dark:border-dark3 bg-none hover:bg-slate-200 dark:hover:bg-dark3 slate-300 transition-all duration-300`,
                        button_next: `${defaultClassNames.button_next} w-[36px] h-[36px] desktop:w-[32px] desktop:h-[32px] border-[1.5px] border-slate-200 dark:border-dark3 bg-none hover:bg-slate-200 dark:hover:bg-dark3 transition-all duration-300`,
                        chevron: `${defaultClassNames.chevron} w-[16px] h-[16px] fill-lightButton dark:fill-slate-500`,
                        weekday: "",
                        day: `${defaultClassNames.day} w-[40px] h-[40px] desktop:w-[32px]! desktop:h-[32px]! desktop:[&:not(.rdp-selected):hover]:bg-slate-200 dark:desktop:[&:not(.rdp-selected):hover]:bg-slate-700 [&:not(.rdp-selected)]:rounded-full`,
                        day_button: `${defaultClassNames.day_button} w-[40px] h-[40px] desktop:w-[32px]! desktop:h-[32px]! cursor-pointer`,
                        today: `${defaultClassNames.today} [&:not(.rdp-selected)]:bg-slate-200 dark:[&:not(.rdp-selected)]:bg-dark3`,
                      }}
                      mode="range"
                      endMonth={new Date()}
                      selected={tempFilter?.searchDate}
                      onSelect={(selected) => setTempFilter({ ...tempFilter, searchDate: selected })}
                      fixedWeeks={true}
                    />
                  </div>
                  <div className="fixed w-screen h-screen bg-black/40 left-0 top-0 z-[1]" onClick={() => setShowCalendar(false)}></div>
                </>
              )}
            </div>
          </div>
          <div className="mt-[40px] mb-12 portrait:sm:mt-12 landscape:lg:mt-12 w-full grid grid-cols-[1fr_2fr] gap-[20px]">
            <button className="appButton2" onClick={clearFilter}>
              {t("searchModal.clear")}
            </button>
            <button className="appButton1" onClick={search}>
              {t("searchModal.search")}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
