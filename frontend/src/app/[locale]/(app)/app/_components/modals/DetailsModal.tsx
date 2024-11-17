import { useState } from "react";
// context
import { useUserInfo } from "../../../web3auth-provider";
// others
import { useTranslations } from "next-intl";
// constants
import { getLocalTime, getLocalDate } from "@/utils/functions";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faFileInvoiceDollar, faList, faXmark } from "@fortawesome/free-solid-svg-icons";
import Toggle from "@/utils/components/Toggle";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
// types
import { Transaction } from "@/db/UserModel";

const DetailsModal = ({ clickedTxn, setDetailsModal, onClickToRefund }: { clickedTxn: Transaction | null; setDetailsModal: any; onClickToRefund: any }) => {
  const userInfo = useUserInfo();
  const [showNote, setShowNote] = useState(false);

  // hooks
  const t = useTranslations("App.Payments.detailsModal");

  return (
    <>
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
        <div className="detailsModalContentContainer pb-[16px]">
          {/*--- details ---*/}
          <div className="flex flex-col">
            <div className="detailsLabelText">{t("time")}</div>
            <div className="detailsValueText">
              {getLocalDate(clickedTxn?.date)} | {getLocalTime(clickedTxn?.date)?.time} {getLocalTime(clickedTxn?.date)?.ampm}
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

          {/*--- REFUND STATUS ---*/}
          <div className="modalHeaderFont py-[24px] landscape:xl:desktop:py-[8px]">Refund Status</div>
          {clickedTxn?.refund ? (
            <div className="text-center detailsValueText">{t("paymentRefunded")}</div>
          ) : (
            <div className="space-y-[60px] landscape:xl:desktop:space-y-[40px]">
              {/*--- to refund toggle ---*/}
              <div className="w-full flex items-center justify-between">
                <div className="textBaseApp font-medium text-lightText1 dark:text-darkText1">{t("toRefund")}</div>
                <Toggle checked={clickedTxn?.toRefund} onClick={onClickToRefund} />
              </div>
              {/*--- refund now button ---*/}
              {userInfo && (
                <div className="w-full flex items-center justify-between">
                  <div className="textBaseApp font-medium text-lightText1 dark:text-darkText1">{t("refundNow")}</div>
                  <button
                    className="buttonPrimaryColor flex-none w-[120px] landscape:xl:desktop:w-[100px] h-[48px] portrait:sm:h-[52px] landscape:lg:h-[52px] landscape:xl:desktop:h-[40px] textLg landscape:xl:desktop:text-base font-semibold border-2 rounded-full"
                    onClick={() => setDetailsModal(false)}
                  >
                    {t("refundButton")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
    </>
  );
};

export default DetailsModal;
