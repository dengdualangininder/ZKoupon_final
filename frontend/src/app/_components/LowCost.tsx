import { currencyToData } from "@/utils/constants";

const LowCost = ({ merchantCurrency }: { merchantCurrency: string }) => {
  return (
    <div className="w-[77%] py-[100px] flex justify-between">
      {/*--- text (left) ---*/}

      <div className="w-[550px]">
        {/*--- header ---*/}
        <div className="homepageHeaderFont">A cost-efficient payments platform</div>
        {/*--- body ---*/}
        <div className="mt-8 w-[500px] text-base">
          Although blockchain payments promises lower fees than traditional digital payments, most blockchain payment platforms still charge 1-2% in fees. Flash charges 0%. This is
          because Flash works by integrating existing low-cost blockchain infrastructure (the Polygon network and cryptocurrency exchanges) to transfer funds and convert USDC to
          fiat. Flash is not a middleman and, therefore, we don’t charge any fees.
        </div>
      </div>
      {/*--- cards (right) ---*/}
      <div className="space-y-7">
        {/*--- card 1 ---*/}
        <div className="lowCostCard">
          <div className="lowCostCardHeader">0% Processing Fees</div>
          <div className="lowCostCardBody">Flash does not charge processing fees or take a cut from each transaction.</div>
        </div>

        {/*--- card 2 ---*/}
        <div className="lowCostCard">
          <div className="lowCostCardHeader">$0 Withdrawal Fees</div>
          <div className="lowCostCardBody">
            <div>Transferring funds to the bank costs near zero:</div>
            {/*--- rates ---*/}
            <div className="text-sm">
              <div className="w-full flex justify-between items-center">
                <div>Flash &#129050; {currencyToData[merchantCurrency].cex} (via Polygon)</div>
                <div> ~0.05 USDC</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div>
                  {currencyToData[merchantCurrency].cex} &#129050; Bank (via {currencyToData[merchantCurrency].offrampNetwork})
                </div>
                <div>{currencyToData[merchantCurrency].offrampFee}</div>
              </div>
            </div>
          </div>
        </div>

        {/*--- card 3 ---*/}
        {merchantCurrency != "USD" && (
          <div className="lowCostCard">
            <div className="lowCostCardHeader">True market rates + 0% conversion fees</div>
            <div className="lowCostCardBody">
              <p>
                Flash does not profit by giving you or your customers suboptimal USDC-{merchantCurrency} conversion rates. Conversion rates are taken directly from Coinbase
                Exchange, which has the best rates compared to anywhere else.
              </p>
              <p>The conversion fee on Coinbase is 0.001%.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowCost;
