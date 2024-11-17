import { cookies } from "next/headers";
import App from "./_components/app";
import { FlashInfo } from "@/utils/types";

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // time
  const date = new Date();
  const time = date.toLocaleTimeString("en-US", { hour12: false }) + `.${date.getMilliseconds()}`;

  console.log("/app page.tsx", time);
  const userType = cookies().get("userType")!.value; // middleware ensures userType exists
  const flashToken = cookies().get("flashToken")!.value; // middleware ensures flashToken exists
  const isUsabilityTest = (await searchParams).test ? true : false;
  const flashInfo: FlashInfo = { userType, flashToken, isUsabilityTest };
  return (
    <>
      <App flashInfo={flashInfo} />
    </>
  );
}
