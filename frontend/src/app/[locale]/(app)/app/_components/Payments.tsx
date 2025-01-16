"use client";
import { useState, useEffect, useRef } from "react";
// custom hooks
import { useW3Info } from "../../web3auth-provider";
import { useTxnsQuery } from "../../hooks";
// i18n
import { useTranslations } from "next-intl";
// components
import QrCodeModal from "./(payments)/QrCodeModal";
import DetailsModal from "./(payments)/DetailsModal";
import SearchModal from "./(payments)/SearchModal";
import CalendarModal from "./(payments)/CalendarModal";
import ExportModal from "./(payments)/ExportModal";
// constants
import { currency2decimal } from "@/utils/constants";
// images
import { HiQrCode, HiMiniArrowRightStartOnRectangle } from "react-icons/hi2";
import { FiDownload, FiSearch } from "react-icons/fi";
// utils
import { getLocalTime, getLocalDateWords, getLocalDate } from "@/utils/functions";
// types
import { PaymentSettings, Transaction } from "@/db/UserModel";
import { FlashInfo, Filter, ModalState } from "@/utils/types";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";

export default function Payments({ flashInfo, setErrorModal, paymentSettings }: { flashInfo: FlashInfo; setErrorModal: any; paymentSettings: PaymentSettings }) {
  console.log("/app Payments.tsx");

  // hooks
  const t = useTranslations("App.Payments");
  const w3Info = useW3Info();
  const loadRef = useRef(null);
  const [filter, setFilter] = useState<Filter>({ last4Chars: "", toRefund: false, refunded: false, searchDate: { from: undefined, to: undefined } }); // setFilter will trigger useTxnsQuery, while setTempFilter will not
  const { data: txns, fetchNextPage, isFetchingNextPage, isFetching } = useTxnsQuery(w3Info, flashInfo, filter);
  console.log("txns.pages.length", txns ? txns.pages[0]?.length : null);

  // states
  const [tempFilter, setTempFilter] = useState<Filter>({ last4Chars: "", toRefund: false, refunded: false, searchDate: { from: undefined, to: undefined } });
  const [clickedTxn, setClickedTxn] = useState<Transaction | null>(null);
  // modal states
  const [searchModal, setSearchModal] = useState<ModalState>({ render: false, show: false });
  const [exportModal, setExportModal] = useState<ModalState>({ render: false, show: false });
  const [calendarModal, setCalendarModal] = useState<ModalState>({ render: false, show: false });
  const [detailsModal, setDetailsModal] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [clearSearchModal, setClearSearchModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);

  useEffect(() => {
    const loadEl = loadRef.current;
    if (!loadEl) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        console.log("isIntersecting");
        fetchNextPage();
      }
    });

    observer.observe(loadEl);

    return () => {
      observer.unobserve(loadEl);
    };
  }, []);

  const clearFilter = () => {
    setFilter({ last4Chars: "", toRefund: false, refunded: false, searchDate: { from: undefined, to: undefined } });
    setTempFilter({ last4Chars: "", toRefund: false, refunded: false, searchDate: { from: undefined, to: undefined } });
    setClearSearchModal(false);
  };

  return (
    <section className="appPageContainer">
      {/*--- TOP BAR (h-140px/180px/160px) ---*/}
      <div
        className="w-full h-[140px] portrait:sm:h-[180px] landscape:lg:h-[180px] desktop:!h-[160px] flex flex-col items-center justify-between overflow-y-auto relative"
        style={{ scrollbarGutter: "stable" }}
      >
        {/*--- BUTTONS ---*/}
        <div className="pt-[20px] portrait:sm:pt-[32px] landscape:lg:pt-[32px] desktop:!pt-[24px] paymentsWidth grid grid-cols-[25%_25%_50%] items-center">
          <div className="paymentsIconContainer" onClick={() => setSearchModal({ render: true, show: true })}>
            <FiSearch className="paymentsIcon" />
          </div>
          {w3Info && (
            <div
              className="paymentsIconContainer"
              onClick={() => {
                if (txns && txns.pages.length > 0) {
                  setExportModal({ render: true, show: true });
                } else {
                  setErrorModal(t("downloadModal.errors.noPayments"));
                }
              }}
            >
              <FiDownload className="paymentsIcon" />
            </div>
          )}
          {!w3Info && (
            <div className="paymentsIconContainer" onClick={() => setSignOutModal(true)}>
              <HiMiniArrowRightStartOnRectangle className="paymentsIcon" />
            </div>
          )}
          <div className="paymentsIconContainer justify-self-end" onClick={() => setQrCodeModal(true)}>
            <HiQrCode className="paymentsIcon" />
          </div>
        </div>

        {/*--- HEADERS ---*/}
        <div className="pb-[12px] paymentsWidth paymentsGrid paymentsHeaderFont">
          <div className="">{t("time")}</div>
          <div>{paymentSettings.merchantCurrency}</div>
          <div className="justify-self-end">{t("customer")}</div>
        </div>

        {/*--- CLEAR SEARCH MODAL ---*/}
        {txns && clearSearchModal && (
          <div className="w-full h-[96px] left-0 top-0 absolute flex justify-center items-center bg-light1 dark:bg-dark1">
            <button onClick={clearFilter} className="border rounded-full px-[20px] py-[8px] border-slate-500 dark:border-slate-400 text-black dark:text-darkText1">
              &#10005; {t("clearSearch")}
            </button>
          </div>
        )}
      </div>

      {/*--- LIST OF PAYMENTS ---*/}
      <div
        className={`${
          w3Info ? "portrait:h-[calc(100vh-80px-140px)] portrait:sm:h-[calc(100vh-140px-180px)]" : "portrait:h-[calc(100vh-0px-140px)] portrait:sm:h-[calc(100vh-0px-180px)]"
        } w-full landscape:h-[calc(100vh-140px)] landscape:lg:h-[calc(100vh-180px)] landscape:desktop:!h-[calc(100vh-160px)] flex flex-col items-center overflow-y-auto overscroll-none overflow-x-hidden select-none relative`}
        style={{ scrollbarGutter: "stable" }}
      >
        {txns && (
          <>
            {txns.pages[0]?.length === 0 ? (
              <div className="flex-1 flex justify-center items-center text-slate-400 dark:text-slate-600">{t("noPayments")}</div>
            ) : (
              <>
                {txns.pages.map((page: Transaction[] | null, index: number) => (
                  <div key={index} className="w-full flex flex-col items-center">
                    {page &&
                      page.map((txn: Transaction) => (
                        <div
                          className={`${txn.refund ? "text-slate-300 dark:text-slate-700" : ""} ${
                            w3Info
                              ? "portrait:h-[calc((100vh-80px-140px)/5)] portrait:sm:h-[calc((100vh-140px-180px)/5)]"
                              : "portrait:h-[calc((100vh-0px-140px)/5)] portrait:sm:h-[calc((100vh-0px-180px)/5)]"
                          } relative paymentsWidth flex-none portrait:sm:px-[12px] landscape:lg:px-[12px] landscape:h-[80px] landscape:lg:h-[calc((100vh-180px)/5)] desktop:!h-[calc((100vh-160px)/5)] desktop:!min-h-[74px] flex items-center justify-center border-t border-light5 dark:border-slate-800 desktop:hover:bg-light2 dark:desktop:hover:bg-dark2 active:bg-light2 dark:active:bg-dark2 desktop:cursor-pointer`}
                          key={txn.txnHash}
                          onClick={() => {
                            setClickedTxn(txn);
                            setDetailsModal(true);
                          }}
                        >
                          <div className="w-full paymentsGrid items-end paymentsText">
                            {/*--- "to refund" tag ---*/}
                            {txn.toRefund && !txn.refund && (
                              <div className="px-[16px] py-[2px] rounded-b-[8px] absolute top-0 right-0 text-sm portrait:sm:text-base landscape:lg:text-base desktop:!text-sm font-medium text-white bg-gradient-to-b from-[#E36161] to-[#FE9494] dark:from-darkButton dark:to-darkButton">
                                {t("toRefund")}
                              </div>
                            )}
                            {/*---Time---*/}
                            <div className="relative">
                              <div
                                className={`absolute bottom-[calc(100%-2px)] portrait:sm:bottom-[calc(100%+2px)] landscape:lg:bottom-[calc(100%+2px)] text-[14px] portrait:sm:text-[18px] landscape:lg:text-[18px] desktop:!text-[14px] font-medium ${
                                  txn.refund ? "text-slate-300 dark:text-slate-700" : "textGray"
                                }`}
                              >
                                {getLocalDateWords(txn.date)?.toUpperCase()}
                              </div>
                              {getLocalTime(txn.date)?.time}
                              <span className="leading-none ml-[6px] text-[16px] portrait:sm:text-[20px] landscape:lg:text-[20px] desktop:!text-[16px] font-medium">
                                {getLocalTime(txn.date)?.ampm}
                              </span>
                            </div>
                            {/*--- Amount ---*/}
                            <div>{txn.currencyAmount.toFixed(currency2decimal[paymentSettings.merchantCurrency])}</div>
                            {/*--- Customer ---*/}
                            <div className="justify-self-end">..{txn.customerAddress.substring(txn.customerAddress.length - 4)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </>
            )}
          </>
        )}
        <div ref={loadRef} className="w-full flex justify-center">
          {isFetchingNextPage && isFetching && (
            <div className="pb-[32px]">
              <SpinningCircleGray />
            </div>
          )}
        </div>
      </div>

      {searchModal.render && (
        <SearchModal
          searchModal={searchModal}
          setSearchModal={setSearchModal}
          setFilter={setFilter}
          tempFilter={tempFilter}
          setTempFilter={setTempFilter}
          setCalendarModal={setCalendarModal}
          clearFilter={clearFilter}
          setErrorModal={setErrorModal}
          setClearSearchModal={setClearSearchModal}
        />
      )}
      {exportModal.render && <ExportModal exportModal={exportModal} setExportModal={setExportModal} setErrorModal={setErrorModal} />}
      {calendarModal.render && (
        <CalendarModal tempFilter={tempFilter} setTempFilter={setTempFilter} calendarModal={calendarModal} setCalendarModal={setCalendarModal} setErrorModal={setErrorModal} />
      )}
      {qrCodeModal && <QrCodeModal setQrCodeModal={setQrCodeModal} paymentSettings={paymentSettings} setErrorModal={setErrorModal} />}
      {detailsModal && (
        <DetailsModal
          paymentSettings={paymentSettings}
          flashInfo={flashInfo}
          clickedTxn={clickedTxn}
          setClickedTxn={setClickedTxn}
          setDetailsModal={setDetailsModal}
          setErrorModal={setErrorModal}
        />
      )}
    </section>
  );
}
