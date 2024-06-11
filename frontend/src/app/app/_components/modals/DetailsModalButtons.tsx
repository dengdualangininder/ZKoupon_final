// nextjs
import Image from "next/image";
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
        {/*--- DETAILS + ACTIONS ---*/}
        <div className="w-full h-full flex flex-col min-h-[650px] pb-3 justify-evenly my-auto">
          {/*--- details ---*/}
          <div className="h-[52%] min-h-[340px] max-h-[380px] flex flex-col justify-between">
            <div className="detailsHeaderText">Payment Details</div>
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
          </div>
          {/*--- Available Actions ---*/}
          <div className="flex flex-col justify-between h-[22%] min-h-[140px] max-h-[150px]">
            <div className="detailsHeaderText">Available Actions</div>
            {clickedTxn?.refund ? (
              <div>Payment has been refunded</div>
            ) : (
              <div className="flex space-x-10">
                {/*--- refund ---*/}
                {isAdmin && (
                  <div className="flex flex-col items-center cursor-pointer desktop:hover:opacity-50 active:opacity-50">
                    <div className="w-[60px] h-[60px] flex items-center justify-center rounded-full bg-gray-200">
                      <div className="relative w-[36px] h-[36px]">
                        <Image src="/refund.svg" alt="refund" fill />
                      </div>
                    </div>
                    <div className="text-sm text-center font-semibold text-gray-500">REFUND</div>
                  </div>
                )}
                {/*--- to refund ---*/}
                <div className="flex flex-col items-center cursor-pointer desktop:hover:opacity-50 active:opacity-50">
                  <div className="w-[60px] h-[60px] flex items-center justify-center rounded-full bg-gray-200">
                    <div className="relative w-[32px] h-[32px]">
                      <Image src="/addRefundNote.svg" alt="refund" fill />
                    </div>
                  </div>
                  <div className="text-sm text-center font-semibold text-gray-500">
                    {clickedTxn?.toRefund ? (
                      <div>
                        REMOVE
                        <br />
                        "TO REFUND"
                      </div>
                    ) : (
                      <div>
                        MARK AS
                        <br />
                        "TO REFUND"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/*--- CLOSE BUTTON ---*/}
          <div className="w-full flex items-center">
            <button className="buttonSecondary" onClick={() => setDetailsModal(false)}>
              CLOSE
            </button>
          </div>
        </div>

        {/*--- button ---*/}
        {clickedTxn?.refund || refundStatus === "refunded" ? (
          <div className="hidden pt-4 text-center textLg font-bold text-gray-400">This payment has been refunded</div>
        ) : (
          <div className="hidden pt-4 w-full">
            {isAdmin ? (
              <div className="w-full flex flex-col items-center space-y-6">
                <button className="buttonPrimary" onClick={onClickRefund}>
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
              <button className="buttonPrimary" onClick={onClickToRefund}>
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
