import { currency2rateDecimal, currency2bank, currency2cex } from "@/utils/constants";
import { useState, useEffect } from "react";

const Why = ({ merchantCurrency }: { merchantCurrency: string }) => {
  const [rates, setRates] = useState({ usdcToLocal: 0, usdToLocal: 0 });

  useEffect(() => {
    getRates();
  }, [merchantCurrency]);

  const getRates = async () => {
    if (merchantCurrency == "USD") {
      setRates({ usdcToLocal: 1, usdToLocal: 1 });
    } else {
      const ratesRes = await fetch("/api/getRates", {
        method: "POST",
        body: JSON.stringify({ merchantCurrency: merchantCurrency }),
        headers: { "content-type": "application/json" },
      });
      const ratesData = await ratesRes.json();
      console.log("ratesData", ratesData);
      if (ratesData.status == "success") {
        setRates({ usdcToLocal: Number(ratesData.usdcToLocal), usdToLocal: Number(ratesData.usdToLocal) });
      }
    }
  };

  return (
    <div className="homeSectionSize">
      {/*--- HEADER ---*/}
      <div className="w-full homeHeaderFont">Why set up crypto payments?</div>
      {/*--- BODY ---*/}
      <div
        className={`${
          merchantCurrency == "USD" ? "xl:h-[250px]" : "xl:h-[350px] xl:desktop:h-[325px]"
        } mt-10 w-full flex flex-col items-center xl:flex-row xl:justify-center xl:space-x-16 space-y-6 xl:space-y-0`}
      >
        {/*--- card1 ---*/}
        <div className="whyCard">
          <div className="whyCardHeader">
            Attract <span className="text-blue-700">a young and growing demographic</span>
          </div>
          <div className="whyCardBody">Hundreds of millions of users, particularly the younger generation, enjoy using crypto. The MetaMask app has 50+ million users.</div>
        </div>
        {/*--- card2 ---*/}
        {merchantCurrency != "USD" && (
          <div className="whyCard">
            <div className="whyCardHeader">
              Attract <span className="text-blue-700">international tourists</span>
            </div>
            <div className="whyCardBody space-y-4">
              <div>
                Surveys show &gt;80% of tourists who own USDC prefer paying with USDC instead of cash/card. This is because the USDC-to-{merchantCurrency} rate is usually 1-5%
                better than the USD-to-{merchantCurrency} rate at any bank{merchantCurrency == "EUR" ? ", including Wise" : ""}.
              </div>
              <div>
                <div className="w-full flex justify-between">
                  <div>
                    USDC to {merchantCurrency} ({currency2cex[merchantCurrency]}):
                  </div>
                  <div>{rates.usdcToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
                </div>
                <div className="w-full flex justify-between">
                  <div>
                    USD to {merchantCurrency} ({currency2bank[merchantCurrency]}):
                  </div>
                  <div>{rates.usdToLocal.toFixed(currency2rateDecimal[merchantCurrency])}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/*--- card1 ---*/}
        {merchantCurrency == "USD" && (
          <div className="whyCard">
            <div className="whyCardHeader">
              Become <span className="text-blue-700">free and independent</span>
            </div>
            <div className="whyCardBody">You control the entire payments process when you use Flash. No one can withhold payment or block you from using the system.</div>
          </div>
        )}
        {/*--- card3 ---*/}
        <div className="whyCard">
          <div className="whyCardHeader">
            Attract <span className="text-blue-700">big spenders</span>
          </div>
          <div className="whyCardBody">Many users keep their entire savings on the blockchain. These people may be more willing to spend when using USDC than card or cash.</div>
        </div>
      </div>
    </div>
  );
};

export default Why;
