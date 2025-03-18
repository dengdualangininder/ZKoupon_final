import { FaAngleLeft } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Filter } from "@/utils/types";
import { ModalState } from "@/utils/types";

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
              className="w-[104px] portrait:sm:w-[120px] landscape:lg:w-[120px] desktop:!w-[88px] inputHeightApp textInputAppLg text-center inputColor"
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
          <div className="searchModalCategoryContainer border-none">
            <div className="font-medium">{t("searchModal.date")}</div>
            <div
              className={`${
                tempFilter?.searchDate?.to ? "" : "italic text-slate-400 dark:text-zinc-700"
              } inputColor px-[12px] min-w-[110px] inputHeightApp textBaseAppPx flex items-center justify-center cursor-pointer`}
              onClick={() => setCalendarModal({ render: true, show: true })}
            >
              {tempFilter?.searchDate?.to ? `${tempFilter.searchDate.from?.toLocaleDateString()} - ${tempFilter.searchDate.to.toLocaleDateString()}` : t("searchModal.selectDates")}
            </div>
          </div>
          {/*--- button ---*/}
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
