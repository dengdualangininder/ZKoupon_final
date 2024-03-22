"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// wagmi
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Connector } from "@wagmi/base";

// import other
import axios from "axios";
// constants
import { abb2full, countryData } from "@/utils/constants";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import SpinningCircleGray, { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";

const Login = () => {
  const [email, setEmail] = useState(""); // employee login email
  const [employeePass, setEmployeePass] = useState(""); // employee login password
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [modalState, setModalState] = useState("");
  const [show, setShow] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [myConnectors, setMyConnectors] = useState([{}]);
  const [isMobileAndNotStandalone, setIsMobileAndNotStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [browser, setBrowser] = useState<string>("Safari");

  let { connectAsync, connect, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const router = useRouter();
  const account = useAccount();

  useEffect(() => {
    // if signed in, redirect to /app page
    if (account.address) {
      console.log("/login, useEffect, already connected", account.address);
      router.push("/app");
      return;
    }

    // if mobile & not standalone, redirect to "Save To Homescreen" page
    const isMobileTemp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); // need "temp" because using it inside this useEffect
    setIsMobile(isMobileTemp);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobileAndNotStandaloneTemp = isMobileTemp && !isStandalone ? true : false; // need "temp" because will be using it inside this useEffect
    setIsMobileAndNotStandalone(isMobileAndNotStandaloneTemp);
    if (isMobileAndNotStandaloneTemp) {
      console.log("detected mobile & not standalone");
      // detect browser and set the state
      const userAgent = navigator.userAgent;
      if (userAgent.match(/chrome|chromium|crios/i)) {
        setBrowser("Chrome");
      } else if (userAgent.match(/firefox|fxios/i)) {
        setBrowser("Firefox");
      } else if (userAgent.match(/safari/i)) {
        setBrowser("Safari");
      } else if (userAgent.match(/opr\//i)) {
        setBrowser("Opera");
      } else if (userAgent.match(/edg/i)) {
        setBrowser("Edge");
      } else if (userAgent.match(/samsungbrowser/i)) {
        setBrowser("Samsung");
      } else if (userAgent.match(/ucbrowser/i)) {
        setBrowser("UC");
      } else {
        setBrowser("");
      }
      return;
    }

    // define myConnectors
    if (isMobile) {
      setMyConnectors([
        { name: "Google", connectorIndex: 0 },
        { name: "Apple", connectorIndex: 1 },
        { name: "Line", connectorIndex: 2 },
        { name: "MetaMask", connectorIndex: 3 },
      ]);
    } else {
      setMyConnectors([
        { name: "Google", connectorIndex: 0 },
        { name: "Line", connectorIndex: 2 },
        { name: "MetaMask", connectorIndex: 3 },
      ]);
    }
    setIsPageLoading(false);
  }, []);

  const employeeSubmit = async () => {
    // e.preventDefault();
    console.log("employee submit clicked");
    //   setIsWaiting(true);
    //   await axios
    //     .post(
    //       import.meta.env.VITE_ISDEV == "true" ? "http://localhost:8080/login" : "https://server.lingpay.io/login",
    //       { merchantEmail: merchantEmail, password: password },
    //       { withCredentials: true }
    //     )
    //     .then((res) => {
    //       if (res.data === "match") {
    //         navigate("/app");
    //       } else if (res.data === "nomatch") {
    //         setErrorModal(true);
    //         setErrorMsg("Email/password incorrect");
    //       } else {
    //         setErrorModal(true);
    //         setErrorMsg("Internal server error");
    //       }
    //     })
    //     .catch(() => {
    //       setErrorModal(true);
    //       setErrorMsg("Server request error");
    //     });
    //   setIsWaiting(false);
  };

  const sendEmail = async () => {
    console.log("send email clicked");
    //   const merchantEmail = document.getElementById("forgotModalInput").value;
    //   if (merchantEmail.includes("@") && merchantEmail.split("@")[1].includes(".")) {
    //     setModalState("sending");
    //     await axios
    //       .post("https://server.lingpay.io/forgot", { merchantEmail: merchantEmail }, { withCredentials: true })
    //       .then((res) => {
    //         if (res.data === "sent") {
    //           console.log("email sent");
    //           setModalState("sent");
    //         } else if (res.data === "no user") {
    //           setErrorModal(true);
    //           setErrorMsg("Email does not match with any account");
    //           setModalState("initial");
    //         } else {
    //           setErrorModal(true);
    //           setErrorMsg("Internal server error");
    //           setModalState("initial");
    //         }
    //       })
    //       .catch((e) => {
    //         setErrorModal(true);
    //         setErrorMsg("Server request error");
    //         setModalState("initial");
    //       });
    //   } else {
    //     setErrorModal(true);
    //     setErrorMsg("Please enter a valid email");
    //     setModalState("initial");
    //   }
  };

  console.log("isPageLoading, last render", isPageLoading);
  return (
    <div className="h-screen flex flex-col items-center xs:justify-center font-nunito">
      {/*--container---*/}
      {isPageLoading ? (
        <div className="flex flex-col items-center">
          <SpinningCircleGrayLarge />
          <div className="mt-4 w-[200px] text-center">Loading...</div>
        </div>
      ) : (
        <div className="px-7 w-[356px] h-[80%] xs:h-[480px] flex flex-col items-center justify-evenly xs:rounded-2xl border-slate-300 xs:border-4">
          {/*--heading---*/}
          <div className="flex items-center">
            <div className="font-bold text-3xl xs:text-[23px] leading-none text-center">Sign in to Flash Business</div>
            {/* <div className="ml-3 relative w-[80px] h-[60px]">
            <Image src="/logo.svg" alt="logo" fill />
          </div> */}
          </div>

          {/*--FOR OWNERS---*/}
          <div className="w-full">
            <div className="font-bold">For owners</div>
            <div className="mt-2 flex flex-col space-y-2">
              {/*--connectors: google, apple, line, phantom, metamask---*/}
              {myConnectors.map<any>((i: any) => (
                <div
                  className="flex items-center bg-white rounded-full pl-8 py-3 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-300 drop-shadow-md"
                  onClick={async () => {
                    setIsPageLoading(true);
                    await connectAsync({ connector: connectors[i.connectorIndex] });
                    router.push("/app");
                  }}
                >
                  <div className="relative w-[32px] h-[32px]">
                    <Image src={`/${i.name.toLowerCase()}.svg`} alt={i.name} fill />
                  </div>
                  <div className="ml-4">Sign in with {i.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/*--FOR EMPLOYEES---*/}
          <div className="w-full">
            <div className="font-bold">For employees</div>
            <form id="loginForm" className="w-full mt-2 flex flex-col">
              {/*--email---*/}
              <div className="w-full flex items-center">
                <label className="loginlabelfont w-[75px] flex-none">Email</label>
                <input type="email" className="logininputfont" onChange={(e) => setEmail(e.target.value)}></input>
              </div>
              {/*--password---*/}
              <div className="mt-2 flex items-center">
                <label className="loginlabelfont w-[75px] flex-none">Password</label>
                <div className="w-full relative">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="none"
                    autoCapitalize="none"
                    className="logininputfont w-full"
                    onChange={(e) => setPassword(e.target.value)}
                  ></input>
                  <div
                    className="absolute right-[12px] top-[17px] xs:top-[6px] cursor-pointer text-xl xs:text-sm text-slate-700"
                    onClick={() => {
                      show ? setShow(false) : setShow(true);
                    }}
                  >
                    {show ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                  </div>
                </div>
              </div>
              {/*--sign in button---*/}
              <button type="submit" className="mt-2 ml-[75px] grow rounded-lg py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold" onClick={employeeSubmit}>
                {isWaiting ? <SpinningCircleWhite /> : <div>Sign in</div>}
              </button>
            </form>

            {/*--forgot password---*/}
            <div
              className="text-xs ml-[75px] mt-4 xs:mt-2 text-end link"
              onClick={() => {
                setForgotModal(true);
                setModalState("initial");
              }}
            >
              Forgot password?
            </div>
          </div>
        </div>
      )}
      {forgotModal && (
        <div>
          <div className="w-[330px] xs:w-[300px] h-[330px] xs:h-[270px] bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---content---*/}
            {modalState === "initial" && (
              <div className="flex flex-col h-full justify-between items-center px-6 py-6">
                <div className="text-xl xs:text-base font-bold">Forgot your password?</div>
                <div className="">
                  <label className="font-bold">Your account email</label>
                  <input id="forgotModalInput" className="w-full logininputfont"></input>
                  {/* <div className="text-red-500 text-center font-bold">{errorMsg}</div> */}
                </div>
                <button onClick={sendEmail} className="w-4/5 xs:w-[150px] flex justify-center items-center loginbutton">
                  Submit
                </button>
                <div onClick={() => setForgotModal(false)} className=" text-red-500 lg:hover:underline active:underline cursor-pointer text-lg">
                  Cancel
                </div>
              </div>
            )}
            {modalState === "sending" && (
              <div className="flex flex-col h-full justify-center items-center px-6 py-6">
                <SpinningCircleGray />
              </div>
            )}
            {modalState === "sent" && (
              <div className="flex flex-col h-full justify-between items-center px-6 py-6">
                <div className="h-full flex items-center text-lg">Please check your email</div>
                <button onClick={() => setForgotModal(false)} className="flex-none w-4/5 loginbutton">
                  DISMISS
                </button>
              </div>
            )}
          </div>
          <div className=" opacity-70 fixed inset-0 z-10 bg-black"></div>
        </div>
      )}
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

export default Login;
