// nextjs
import Image from "next/image";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
// types
import { PaymentSettings, CashoutSettings } from "@/db/models/UserModel";

const Flow = ({ paymentSettingsState, cashoutSettingsState }: { paymentSettingsState: PaymentSettings; cashoutSettingsState: CashoutSettings }) => {
  return (
    <div className="w-[360px] flex flex-col space-y-2">
      {/*--- flash ---*/}
      <div className="w-full flex justify-center">
        <div className="w-[180px] py-2 rounded-full flex items-center justify-center bg-gray-300">
          <div className="text-base font-bold">Flash App</div>
        </div>
      </div>

      {/*--- arrows ---*/}
      <div className="w-full flex flex-col items-center leading-none relative">
        {[1, 2, 3].map(() => (
          <div>
            <FontAwesomeIcon icon={faAngleDown} className="text-xl" />
          </div>
        ))}
        <div className="absolute top-[20px] right-[116px]">USDC</div>
      </div>

      {/*--- flash ---*/}
      <div className="w-full flex justify-center">
        <div className="w-[180px] py-2 rounded-full flex items-center justify-center bg-gray-300">
          <div className="text-base font-bold">Coinbase</div>
        </div>
      </div>

      {/*--- arrows ---*/}
      <div className="w-full flex flex-col items-center leading-none relative">
        {[1, 2, 3].map(() => (
          <div>
            <FontAwesomeIcon icon={faAngleDown} className="text-xl" />
          </div>
        ))}
        <div className="absolute top-[20px] right-[128px]">EUR</div>
      </div>

      {/*--- flash ---*/}
      <div className="w-full flex justify-center">
        <div className="w-[180px] py-2 rounded-full flex items-center justify-center bg-gray-300">
          <div className="text-base font-bold">Your Bank</div>
        </div>
      </div>
    </div>
  );
};

export default Flow;
