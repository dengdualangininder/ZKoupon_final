"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const RefundModal = ({ setRefundModal }: { setRefundModal: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <div className="">
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setRefundModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">Refunding Payments</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            <div className="flex flex-col">
              {/*---text---*/}
              <div className="">
                Due to seurity issues, employees do not have the ability to transfer funds and, thus, make refunds. If you (the owner) will not be present as the cash register,
                then we recommend you log into your Flash App at the end of each day to make refunds. Refunds will immediately appear in the customer's Web3 Wallet (while it takes
                up to 3 days to issue credit card refunds).
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default RefundModal;
