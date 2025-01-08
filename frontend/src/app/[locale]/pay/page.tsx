import Pay from "./_components/Pay";
import { getUsdcToLocal, getUsdToLocal } from "@/utils/serverFns";
import { currency2decimal, currency2rateDecimal, currency2symbol, currency2correction } from "@/utils/constants";

export default async function page({ searchParams }: { searchParams: any }) {
  const { merchantCurrency } = searchParams;

  // get rates in parallel
  let fxSavings;
  try {
    var [usdcToLocal, usdToLocal] = await Promise.all([getUsdcToLocal(merchantCurrency), getUsdToLocal(merchantCurrency)]);
    if (usdcToLocal && usdcToLocal) {
      var rates = { usdcToLocal: usdcToLocal, usdToLocal: usdToLocal };
      const correction = currency2correction[merchantCurrency!];
      fxSavings = (((rates.usdcToLocal * correction) / rates.usdToLocal - 1) * 100).toFixed(1);
    } else {
      throw new Error();
    }
  } catch (e) {
    console.log(e);
    var rates = { usdcToLocal: 0, usdToLocal: 0 };
  }

  return (
    <>
      <Pay rates={rates} fxSavings={fxSavings} />
    </>
  );
}
