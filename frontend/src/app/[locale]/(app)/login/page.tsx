import Login from "./_components/Login";
import { cookies } from "next/headers";

export default function page() {
  console.log("/login, page.tsx");

  const userTypeFromCookies = cookies().get("userType")?.value;
  return (
    <>
      <Login userTypeFromCookies={userTypeFromCookies} />
    </>
  );
}
