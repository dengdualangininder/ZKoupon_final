import React from "react";

const Why = ({ merchantCurrency }: { merchantCurrency: string }) => {
  return (
    <div className="homeSectionSize">
      {/*--- HEADER ---*/}
      <div className="w-full homeHeaderFont">
        Why set up crypto
        <br />
        payments?
      </div>
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
                better than the USD-to-{merchantCurrency} rate at any bank, including Wise.
              </div>
              <div>
                <div className="w-full flex justify-between">
                  <div>USDC to {merchantCurrency} (Coinbase):</div>
                  <div>0.9251</div>
                </div>
                <div className="w-full flex justify-between">
                  <div>USD to {merchantCurrency} (Wise):</div>
                  <div>0.9321</div>
                </div>
                <div className="w-full flex justify-between">
                  <div>USD to {merchantCurrency} (BNP Paribas):</div>
                  <div>0.9321</div>
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
