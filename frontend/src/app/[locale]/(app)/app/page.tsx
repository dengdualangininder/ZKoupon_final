import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import App from "./_components/App";
import { NullaInfo } from "@/utils/types";
import { PrismaClient } from "@prisma/client";
import { defaultRates } from "@/utils/constants";
import { AllRates } from "@/utils/types";

const prisma = new PrismaClient();

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;
  console.log(time, "(app)/app/page.tsx");

  // get rates from Supabase, cache to Data Cache
  const getAllRates = unstable_cache(
    async () => {
      const data = await prisma.rate.findMany({ orderBy: { id: "desc" }, take: 1 });
      var allRates: AllRates = {
        EUR: { usdToLocal: data[0].usdToEur ?? defaultRates.EUR.usdToLocal, usdcToLocal: data[0].usdcToEur ?? defaultRates.EUR.usdcToLocal },
        GBP: { usdToLocal: data[0].usdToGbp ?? defaultRates.GBP.usdToLocal, usdcToLocal: data[0].usdcToGbp ?? defaultRates.GBP.usdcToLocal },
        TWD: { usdToLocal: data[0].usdToTwd ?? defaultRates.TWD.usdToLocal, usdcToLocal: data[0].usdcToTwd ?? defaultRates.TWD.usdcToLocal },
        USD: { usdToLocal: 1, usdcToLocal: 1 },
      };
      return allRates;
    },
    ["rates"],
    { revalidate: 600 }
  );

  try {
    var allRates = await getAllRates();
  } catch (e) {
    var allRates = defaultRates;
  }

  console.log("allRates", allRates);

  const userType = cookies().get("userType")!.value; // middleware ensures userType exists
  const userJwt = cookies().get("userJwt")!.value; // middleware ensures userJwt exists
  const nullaInfo: NullaInfo = { userType, userJwt };
  const isCbLinked = cookies().get("cbRefreshToken")?.value ? true : false;
  console.log("isCbLinked", isCbLinked);

  return (
    <>
      <App nullaInfo={nullaInfo} allRates={allRates} isCbLinked={isCbLinked} />
    </>
  );
}
