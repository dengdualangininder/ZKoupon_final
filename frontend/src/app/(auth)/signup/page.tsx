"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { countryData, CEXdata, abb2full } from "../../_utils/constants";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "../../_utils/components/SpinningCircleWhite";

const Signup = () => {
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState("");

  // const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    const getCountry = async () => {
      let data: { ip: string; country: string } = (await axios.get("https://api.country.is")).data;
      setCountry(abb2full[data.country] ?? "United States");
    };
    getCountry();
  }, []);

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const merchantEmail = (document.getElementById("signupMerchantEmail") as HTMLInputElement)?.value;
    const password = (document.getElementById("signupPassword") as HTMLInputElement)?.value;
    if (merchantEmail.includes("@") && merchantEmail.split("@")[1].includes(".")) {
      if (/^(?!.* )(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$&%^*-]).{8,}$/.test(password)) {
        setIsWaiting(true);
        await axios
          .post(
            process.env.ISDEV == "true" ? "http://localhost:8080/signup" : "https://server.lingpay.io/signup",
            {
              merchantEmail: merchantEmail,
              password: password,
              paymentSettings: {
                merchantCountry: country,
                merchantCurrency: countryData[country].currency,
                merchantNetworks: countryData[country].networks,
                merchantTokens: countryData[country].tokens,
              },
              cashoutSettings: { CEX: countryData[country].CEXes[0] },
            },
            { withCredentials: true }
          )
          .then((res) => {
            if (res.data === "user created") {
              router.push("/app");
              console.log("user created");
            } else if (res.data === "user exists") {
              setErrorModal(true);
              setErrorMsg("Email already in use");
            } else {
              setErrorModal(true);
              setErrorMsg("Internal server error");
            }
          })
          .catch((e) => {
            alert("server error 2");
            console.log(e);
          });
      } else {
        setErrorModal(true);
        setErrorMsg("Please enter a valid password");
      }
    } else {
      setErrorModal(true);
      setErrorMsg("Please enter a valid email");
    }
    setIsWaiting(false);
  };

  return (
    <div className="h-screen flex flex-col items-center xs:justify-center font-nunito">
      {/*--container---*/}
      <div className="px-8 w-full xs:w-[356px] h-[80%] xs:h-[450px] flex flex-col items-center justify-evenly xs:rounded-2xl border-slate-300 xs:border-4">
        {/*--logo---*/}
        <div className="flex items-center">
          <div className="w-[100px] xs:w-[120px] relative">
            <Image src="/logo.svg" objectFit="contain" alt="logo" width={150} height={150} />
          </div>
        </div>
        {/*--heading---*/}
        <div className="flex items-center">
          <div className="font-bold text-3xl xs:text-2xl leading-none text-center">Create a new account</div>
        </div>
        {/*--form---*/}
        <form id="loginForm" className="flex flex-col justify-center w-full">
          <label className="font-bold text-lg xs:text-base">Email</label>
          <input id="signupMerchantEmail" type="email" className="logininputfont"></input>
          <div className="mt-4 font-bold relative">
            <span className="group">
              <span className="">
                Create password <FontAwesomeIcon icon={faCircleInfo} className="ml-0.5 text-lg xs:text-sm text-gray-300" />
              </span>
              {/*---tooltip---*/}
              <div className="font-normal invisible group-hover:visible pointer-events-none absolute left-0 bottom-[calc(100%+8px)] w-[260px] xs:w-[230px] px-3 py-2 text-base xs:text-sm leading-tight bg-slate-100 border border-slate-300 rounded-lg z-[1]">
                <p>1 lower case letter</p>
                <p>1 upper case letter</p>
                <p>1 number</p>
                <p>1 special character #?!@$&%^*-</p>
                <p>at least 8 characters</p>
              </div>
            </span>
          </div>
          <div className="w-full relative">
            <input id="signupPassword" type={show ? "text" : "password"} autoComplete="none" className="logininputfont w-full" autoCapitalize="none"></input>
            <div
              className="absolute right-[24px] top-[17px] xs:top-[10px] cursor-pointer text-xl xs:text-lg text-slate-700"
              onClick={() => {
                show ? setShow(false) : setShow(true);
              }}
            >
              {show ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </div>
          </div>
          <div className="mt-8 xs:mt-5 flex justify-center">
            <button type="submit" className="w-4/5 flex justify-center items-center loginbutton" onClick={submit}>
              {isWaiting ? <SpinningCircleWhite /> : <div>Create account</div>}
            </button>
          </div>
        </form>
        {/*--already have an account?---*/}
        <div className="flex items-center text-lg xs:text-base text-center">
          Already have an account?
          <Link href="/login" className="ml-1 text-blue-500 font-bold cursor-pointer lg:hover:underline active:underline">
            Sign in
          </Link>
        </div>
      </div>
      {errorModal && (
        <div className="">
          <div className="w-[270px] h-[270px] flex flex-col items-center px-6 py-6 bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---content---*/}
            <div className="h-full flex justify-center items-center">
              {/*---msg---*/}
              <div className="text-lg leading-tight md:text-base md:leading-snug">{errorMsg}</div>
            </div>
            {/*---close button---*/}
            <button onClick={() => setErrorModal(false)} className="w-[160px] loginbutton tracking-wide">
              DISMISS
            </button>
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
    </div>
  );
};

export default Signup;
