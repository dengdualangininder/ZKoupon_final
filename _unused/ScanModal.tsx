"use client";
import screenshot from "../../assets/screenshot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { list2string, countryData } from "@/utils/constants";

const ScanModal = ({ setScanModal, merchantCountry }) => {
  return (
    <div>
      <div className="modalContainer">
        {/*---close button---*/}
        <button
          onClick={() => setScanModal(false)}
          className="absolute top-[calc(100%-20px)] right-[calc(50%-30px)] sm:right-[-20px] sm:top-[-20px] h-[60px] w-[60px] sm:h-[48px] sm:w-[48px] bg-red-400 rounded-full hover:bg-red-500 text-3xl"
        >
          <FontAwesomeIcon icon={faXmark} className="text-white pt-1" />
        </button>
        {/*---Title and Close Button---*/}
        <div className="modalHeaderContainer">
          <div className="modalHeaderText">How does a customer pay?</div>
        </div>
        {/*---Content---*/}
        <div className="overflow-auto overscroll-contain">
          <div className="modalContentContainer">
            <div className="flex flex-col md:flex-row items-start">
              {/*---text---*/}
              <div className="text-lg md:text-sm leading-snug">
                <div>When a customer scans your QR code, their MetaMask wallet will open and show our interface (see picture).</div>
                <div className="mt-2 relative">
                  The customer <span className="font-bold">enters the amount of local currency</span>. They then select a{" "}
                  <span className="group link">
                    stablecoin{" "}
                    <div className="absolute invisible group-hover:visible pointer-events-none px-3 py-2 leading-tight bg-slate-100 text-slate-700 border border-slate-600 rounded-lg z-[1]">
                      On Ling Pay, customers can only send currency-backed stablecoins. Currency-backed stablecoins are tokens that are backed by currency in a bank. For example,
                      USDC is a USD-backed stablecoin issued by a company called Circle. Because of strict regulations, 1 USDC can always be redeemed by 1 USD. USDC and USDT are
                      the most popular currency-backed stablecoins used today.
                    </div>
                  </span>
                  (and network) for payment.
                </div>
                <div className="mt-2">
                  Stablecoins will be sent directly to your MetaMask wallet. They can be converted to the local currency on a cryptocurrency exchange (Step 4).
                </div>
                {merchantCountry ? (
                  <div className="mt-2 relative ">
                    <span className="font-bold">
                      For stores in {countryData[merchantCountry].the ? "the" : ""} {merchantCountry}
                    </span>
                    , we recommend you allow customers to send you the <span className="">{list2string(countryData[merchantCountry]["tokens"])}</span> stablecoins on the{" "}
                    <span className="">{list2string(countryData[merchantCountry]["networks"])}</span> chains (
                    <span className="link group">
                      why
                      <div className="absolute invisible group-hover:visible pointer-events-none px-3 py-2 leading-tight bg-slate-100 text-slate-700 border border-slate-600 rounded-lg z-[1]">
                        In Step 4, you will convert stablecoins to the local currency on a cryptocurrency exchange. The exchange we recommend is{" "}
                        <span className="font-bold">{countryData[merchantCountry].CEXes[0]}</span>. These tokens and chains are compatible with it. Allowing more chains and tokens
                        will improve the user experience.
                      </div>
                    </span>
                    ). To change this, go to "Advanced Options" in Step 1.
                  </div>
                ) : null}
                <div className="mt-2 relative">
                  The amount of stablecoins you receive is calculated from stablecoin exchange rates on popular cryptocurrency exchanges in your country. Businesses will never lose
                  from fluctuating rates (
                  <span className="group">
                    <span className="link">how?</span>
                    <div className="absolute bottom-6 invisible group-hover:visible pointer-events-none px-3 py-2 leading-tight bg-slate-100 text-slate-700 border border-slate-600 rounded-lg z-[1]">
                      We add 0.3~0.5% to the exchange rate in favor of the business, so <span className="font-bold">you will never lose from fluctuating exchange rates</span> in
                      the long-run (you might even earn a little extra). We take zero fees, so the best rates are always offered to the business and the customer.
                    </div>
                  </span>
                  ).
                </div>
                <div className="mt-2">
                  For <span className="font-bold">online payments</span>, where businesses can collect the customer's email and an item description, please Talk to An Advisor to
                  get set up.
                </div>
              </div>
              {/*---image---*/}
              <div className="md:ml-4 w-full md:w-[260px] flex-none flex justify-center">
                {/* <img src={screenshot} className="object-contain my-4 md:my-0 w-[250px] md:w-[260px] border border-slate-300 rounded-2xl" /> */}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4"></div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ScanModal;
