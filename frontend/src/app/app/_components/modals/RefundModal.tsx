"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const RefundModal = ({ setRefundModal }) => {
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
                To make a refund, stablecoins needs to be transferred from a MetaMask wallet owned by the business to the customer's MetaMask wallet. We do not recommend giving
                normal employees access to your MetaMask wallet. Therefore, if you (the owner) are not the cashier, you will need to devise a method to give refunds. Here, we
                suggest several methods:
              </div>
              <div className="mt-2 font-bold">Method 1: Refund customers at the end of the day</div>
              <div className="">
                Have the cashier note down which transactions need to be refunded. Then, at the end of the day, you (the owner) can refund all customers. Credit card refunds take
                up to 3 business days, so customers should be okay with the wait.
              </div>
              <div className="mt-2 font-bold">Method 2: Allow a trusted manager to access your MetaMask wallet</div>
              <div className="">
                Have a trusted manager download MetaMask on their phone (not the device your employees are using) and "import" your already existing MetaMask wallet. When a cashier
                needs to make a refund, they can call the manager. The manager can then execute the refund on their phone (the manager should sign into Ling Pay using the Employee
                Password).
              </div>
              <div className="mt-1">
                You (the owner) should transfer stablecoins to your cryptocurrency exchange once or twice per day to minimize the amount of funds in your MetaMask wallet. Do this
                by clicking the "Transfer Stablecoins from MetaMask To Your Cryptocurrency Exchange" button in the "Cash Out" tab.
              </div>
              <div className="mt-2 font-bold">Method 3: Create a new MetaMask wallet</div>
              <div className="">
                Download MetaMask on the device employees are using. Create a new wallet (instead of "importing" your already existing wallet). Give the password to the cashier.
                Transfer stablecoins and some native blockchain tokens to the new wallet. For example, if you anticipate $50 in refunds per day, and you accept USDC and USDT on the
                Polygon and BNB chains, then transfer $50 worth of USDC and $50 worth of USDT on both Polygon and BNB to the new account ($200 total). Keep the funds in this wallet
                at a minimum, as any employee can transfer funds out of this wallet from any device at any time.
              </div>
              <div className="mt-2 mb-4 font-bold">To speak to an advisor, please email contact@lingpay.io</div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default RefundModal;
