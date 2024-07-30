import { useState } from "react";
// others
import { useTranslations } from "next-intl";
// constants
import { getLocalTime, getLocalDate } from "../Payments";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faFileInvoiceDollar, faList, faXmark } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
// types
import { Transaction } from "@/db/models/UserModel";

const DetailsModal = ({
  clickedTxn,
  setClickedTxn,
  refundStatus,
  toRefundStatus,
  setDetailsModal,
  isAdmin,
  onClickRefund,
  onClickToRefund,
}: {
  clickedTxn: Transaction | null;
  setClickedTxn: any;
  toRefundStatus: string;
  refundStatus: string;
  setDetailsModal: any;
  isAdmin: boolean;
  onClickRefund: any;
  onClickToRefund: any;
}) => {
  const [showNote, setShowNote] = useState(false);

  // hooks
  const t = useTranslations("App.Payments.detailsModal");

  return (
    <div className="">
      <div className="detailsModal">
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer" onClick={() => setDetailsModal(false)}>
          <div className="xButton">&#10005;</div>
        </div>
        {/*--- mobile back ---*/}
        <div className="mobileBack">
          <FontAwesomeIcon icon={faAngleLeft} onClick={() => setDetailsModal(false)} />
        </div>

        {/*--- HEADER ---*/}
        <div className="detailsModalHeader">{t("title")}</div>

        {/*--- CONTENT ---*/}
        <div className="w-full flex-1 px-8 portrait:sm:px-10 landscape:lg:px-10 landscape:xl:desktop:px-[32px] space-y-[12px] overflow-y-auto scrollbar">
          {/*--- details ---*/}
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("time")}</div>
            <div className="detailsValueText">
              {getLocalDate(clickedTxn?.date)} {getLocalTime(clickedTxn?.date)?.time} {getLocalTime(clickedTxn?.date)?.ampm}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("value")}</div>
            <div className="detailsValueText">
              {clickedTxn?.currencyAmount} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("tokens")}</div>
            <div className="detailsValueText">{clickedTxn?.tokenAmount} USDC</div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("rate")}</div>
            <div className="detailsValueText">
              1 USDC = {clickedTxn?.blockRate} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("customerAddress")}</div>
            <div className="detailsValueText break-all">{clickedTxn?.customerAddress}</div>
          </div>
          <div className="py-[16px] desktop:py-[8px] w-full flex items-center justify-between">
            <div className="detailsLabelText">{t("toRefund")}</div>
            {/*--- toggle ---*/}
            <div className="mt-1 desktop:mt-2 w-[56px] h-[30px] desktop:w-[48px] desktop:h-[25px] flex items-center relative cursor-pointer">
              <input type="checkbox" checked={clickedTxn?.toRefund} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 dark:bg-dualGray peer-checked:bg-blue-600 dark:peer-checked:bg-darkButton rounded-full" onClick={onClickToRefund}></div>
              <div className="w-[26px] h-[26px] desktop:w-[21px] desktop:h-[21px] peer-checked:translate-x-full rtl:peer-checked:-translate-x-full content-[''] absolute left-[2px] desktop:left-[3px] border-gray-300 border rounded-full bg-white transition-all pointer-events-none"></div>
            </div>
          </div>

          {/* <div className="flex flex-col">
              <div className="detailsLabelText">
                Notes{" "}
                <span className="link font-normal" onClick={() => setShowNote(!showNote)}>
                  {showNote ? "\u25B2" : "\u25BC"}
                </span>
              </div>
              <div className={`detailsValueText ${showNote ? "" : "line-clamp-2"} text-base`}>{clickedTxn?.note}</div>
            </div> */}

          {/*--- refund button ---*/}
          <div className="w-full pt-[40px] desktop:pt-[24px] pb-[24px] flex items-center">
            {clickedTxn?.refund ? (
              <div>{t("paymentRefunded")}</div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isAdmin ? (
                  <button className="buttonPrimary landscape:xl:desktop:text-base" onClick={() => setDetailsModal(false)}>
                    {t("refundButton")}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
    </div>
  );
};

export default DetailsModal;
