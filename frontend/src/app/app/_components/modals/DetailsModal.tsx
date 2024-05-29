// constants
import { getLocalTime, getLocalDate } from "../Payments";
// images
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
  return (
    <div className="textBase">
      <div className="detailsModal overflow-y-auto">
        {/*--- TITLE + CLOSE ---*/}
        <div className="flex-none w-full h-[90px] desktop:h-[70px] flex items-center">
          <div className="w-full detailsHeaderText text-center">Payment Details</div>
          <div
            className="w-[56px] h-[56px] flex items-center justify-center rounded-full border border-transparent absolute right-4 desktop:hover:bg-gray-200 active:opacity-50 cursor-pointer select-none"
            onClick={() => setDetailsModal(false)}
          >
            <div className="text-3xl">&#10005;</div>
          </div>
        </div>
        {/*--- DETAILS ---*/}
        <div className="detailsContainer">
          <div className="flex flex-col">
            <div className="detailsLabelText">Time</div>
            <div className="detailsValueText">
              {getLocalDate(clickedTxn?.date)} {getLocalTime(clickedTxn?.date).time} {getLocalTime(clickedTxn?.date).ampm}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">Payment Value</div>
            <div className="detailsValueText">
              {clickedTxn?.currencyAmount} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">Tokens Received</div>
            <div className="detailsValueText">{clickedTxn?.tokenAmount} USDC</div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">Rate</div>
            <div className="detailsValueText">
              1 USDC = {clickedTxn?.blockRate} {clickedTxn?.merchantCurrency}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">Customer's Address</div>
            <div className="detailsValueText break-all">{clickedTxn?.customerAddress}</div>
          </div>
          <div className="flex flex-col">
            <div className="detailsLabelText">"To Refund" Label?</div>
            {/*--- toggle ---*/}
            <div className="mt-1 desktop:mt-2 w-[56px] h-[30px] flex items-center relative">
              <input type="checkbox" checked={clickedTxn?.toRefund} className="sr-only peer" />
              <div className="w-full h-full bg-gray-200 peer-checked:bg-blue-600 rounded-full" onClick={onClickToRefund}></div>
              <div className="w-[26px] h-[26px] peer-checked:translate-x-full rtl:peer-checked:-translate-x-full content-[''] absolute left-[2px] border-gray-300 border rounded-full bg-white transition-all pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/*--- refund button ---*/}
        {clickedTxn?.refund ? (
          <div>Payment has been refunded</div>
        ) : (
          <div className="grow w-full min-h-[160px] flex justify-center items-center">
            {isAdmin ? (
              <button className="modalButtonWhite portrait:lg:text-2xl landscape:xl:text-2xl landscape:xl:desktop:text-lg" onClick={() => setDetailsModal(false)}>
                REFUND NOW
              </button>
            ) : null}
          </div>
        )}

        {/*--- button ---*/}
        {clickedTxn?.refund || refundStatus === "refunded" ? (
          <div className="hidden pt-4 text-center textLg font-bold text-gray-400">This payment has been refunded</div>
        ) : (
          <div className="hidden pt-4 w-full">
            {isAdmin ? (
              <div className="w-full flex flex-col items-center space-y-6">
                <button className="modalButtonBlue" onClick={onClickRefund}>
                  {refundStatus === "initial" && clickedTxn?.refund == false && <div>REFUND NOW</div>}
                  {refundStatus === "processing" && (
                    <div className="flex items-center justify-center">
                      <SpinningCircleGray />
                    </div>
                  )}
                  {(refundStatus === "processed" || clickedTxn?.refund == true) && "Refunded"}
                </button>
              </div>
            ) : (
              <button className="modalButtonBlue" onClick={onClickToRefund}>
                {toRefundStatus == "processing" ? (
                  <div className="flex items-center justify-center">
                    <SpinningCircleWhite />
                  </div>
                ) : (
                  <div>
                    {toRefundStatus == "true" ? "Remove " : "Add "}
                    "To Be Refunded" Note
                  </div>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="modalBlackout" onClick={() => setDetailsModal(false)}></div>
    </div>
  );
};

export default DetailsModal;
