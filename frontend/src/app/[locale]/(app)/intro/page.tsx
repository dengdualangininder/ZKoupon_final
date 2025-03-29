import { cookies } from "next/headers";
import Intro from "./_components/Intro";

export default async function Page() {
  const userType = cookies().get("userType")?.value ?? "";
  const userJwt = cookies().get("userJwt")?.value ?? "";
  const nullaInfo = { userType, userJwt };

  return (
    <>
      <Intro nullaInfo={nullaInfo} />
    </>
  );
}
