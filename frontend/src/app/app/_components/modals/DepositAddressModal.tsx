import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const DepositAddressModal = ({ setDepositAddressModal }) => {
  return (
    <div className="">
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setDepositAddressModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">Finding Your Deposit Address</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-y-auto overscroll-contain h-full">
          <div className="modalContentContainer">
            <div className="flex flex-col leading-tight space-y-2">
              {/*---text---*/}
              <div className="mt-4">1. Sign into your cryptocurrency exchange.</div>
              <div>2. Find and click the "deposit" function. As a reminder, you are depositing "tokens" or "crypto", not "fiat".</div>
              <div>3. Select the token to deposit. Then, select the network.</div>
              <div>4. The deposit address should be revealed. Copy it.</div>
              <div>
                In your Ling Pay account, when you click the "Cash Out" button in the "Cash Out" tab, stablecoins will be sent from your MetaMask wallet to these deposit addresses.
                If your cryptocurrency exchange does not have a deposit address for a network or token, it is ok to leave the field blank.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default DepositAddressModal;
