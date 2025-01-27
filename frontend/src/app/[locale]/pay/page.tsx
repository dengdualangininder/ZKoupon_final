import Pay from "./_components/Pay";
import { currency2correction, defaultRates, currencyToKeys } from "@/utils/constants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function page({ searchParams }: { searchParams: any }) {
  const { merchantCurrency } = searchParams;

  // get rates & calculate fxSavings
  let rates = defaultRates[merchantCurrency];
  let fxSavings;
  if (merchantCurrency !== "USD") {
    try {
      const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });
      const keys = currencyToKeys[merchantCurrency];
      const usdToLocal = data[0][keys.usdToLocal];
      const usdcToLocal = data[0][keys.usdcToLocal];
      if (usdToLocal && usdcToLocal) rates = { usdToLocal, usdcToLocal }; // only update rates with db value if they exist
      const correction = currency2correction[merchantCurrency!]; // correction = 1 - cex fees - 0.003
      fxSavings = (((rates.usdcToLocal * correction) / rates.usdToLocal - 1) * 100).toFixed(1);
    } catch (e) {
      console.log("error in getting rates from Supabase");
    }
  }

  return (
    <>
      <Pay rates={rates} fxSavings={fxSavings} />
    </>
  );
}
