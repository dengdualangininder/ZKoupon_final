import { currencyToData } from "@/utils/constants";

const LowCost = ({ merchantCurrency }: { merchantCurrency: string }) => {
  return (
    <div className="homeSectionSize flex flex-col items-center xl:flex-row xl:items-start xl:justify-between">
      {/*--- text (left) ---*/}
      <div className="w-full xl:w-[50%]">
        {/*--- header ---*/}
        <div className="homeHeaderFont">
          A cost-efficient
          <br />
          payments platform
        </div>
        {/*--- body ---*/}
        <div className="mt-8 w-full xl:desktop:w-[500px] homeBodyFont">
          Although blockchain payments promises lower fees than traditional digital payments, most blockchain payment platforms still charge 1-2% in fees. Flash charges 0%. This is
          because Flash works by integrating existing low-cost blockchain infrastructure (the Polygon network and cryptocurrency exchanges) to transfer funds and convert USDC to
          fiat. Flash is not a middleman and, therefore, we charge zero fees.
        </div>
      </div>
      {/*--- cards (right) ---*/}
      <div className="mt-8 xl:mt-0 w-full xl:w-[50%] space-y-7 flex flex-col items-center">
        {/*--- card 1 ---*/}
        <div className="lowCostCard">
          <div className="homeHeader2Font">0% Processing Fees</div>
          <div className="lowCostCardBody">Flash does not take a cut from any transaction.</div>
        </div>

        {/*--- card 2 ---*/}
        <div className="lowCostCard">
          <div className="homeHeader2Font">$0 Withdrawal Fees</div>
          <div className="lowCostCardBody">
            <div>Transferring funds to the bank costs near zero:</div>
            {/*--- rates ---*/}
            <div className="">
              <div className="w-full flex justify-between items-center">
                <div>Flash&#129050;{currencyToData[merchantCurrency].cex} (via Polygon)</div>
                <div>~0.05 USDC</div>
              </div>
              <div className="w-full flex justify-between items-center">
                <div>
                  {currencyToData[merchantCurrency].cex}&#129050;Bank (via {currencyToData[merchantCurrency].offrampNetwork})
                </div>
                <div>{currencyToData[merchantCurrency].offrampFee}</div>
              </div>
            </div>
          </div>
        </div>

        {/*--- card 3 ---*/}
        {merchantCurrency != "USD" && (
          <div className="lowCostCard">
            <div className="homeHeader2Font">
              Best Rates +<br />
              0% Conversion Fees
            </div>
            <div className="lowCostCardBody">
              <p>
                Flash does not profit by giving you or your customers suboptimal USDC-{merchantCurrency} conversion rates. We use conversion rates from Coinbase Exchange, which has
                the best rates compared to anywhere else.
              </p>
              <p>The conversion fee is 0.001%.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowCost;
