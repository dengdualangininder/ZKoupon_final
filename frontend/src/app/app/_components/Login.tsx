"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// wagmi
import { useAccount, useConnect } from "wagmi";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "@/utils/components/SpinningCircleWhite";
import SpinningCircleGray, { SpinningCircleGrayLarge } from "@/utils/components/SpinningCircleGray";

const Login = ({ isMobile }: { isMobile: boolean }) => {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [modalState, setModalState] = useState("");
  const [show, setShow] = useState(false);
  const [browser, setBrowser] = useState<string>("Safari");

  let { connectAsync, connectors } = useConnect();
  const router = useRouter();
  const account = useAccount();

  // define myConnectors
  if (isMobile) {
    var myConnectors = [
      { name: "Google", connectorIndex: 0 },
      { name: "Apple", connectorIndex: 1 },
      { name: "Line", connectorIndex: 2 },
      { name: "MetaMask", connectorIndex: 3 },
    ];
  } else {
    var myConnectors = [
      { name: "Google", connectorIndex: 0 },
      { name: "Line", connectorIndex: 2 },
      { name: "MetaMask", connectorIndex: 3 },
    ];
  }

  // useEffect(() => {
  //   // if signed in, redirect to /app page
  //   if (account.address) {
  //     console.log("/login, useEffect, already connected", account.address);
  //     router.push("/app");
  //     return;
  //   }
  // }, []);

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

  return (
    <div className="h-screen flex flex-col items-center xs:justify-center font-nunito">
      <div className="px-7 w-[356px] h-full xs:h-[480px] flex flex-col items-center justify-evenly xs:rounded-2xl border-slate-300 xs:border-4">
        {/*--heading---*/}
        <div className="flex flex-col xs:flex-row items-center">
          <div className="hidden xs:block font-bold text-xl xs:text-[23px] w-[230px] leading-none text-center">Sign in to</div>
          <div className="relative w-[200px] h-[80px]">
            <Image src="/logo.svg" alt="logo" fill />
          </div>
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
                  console.log("login page, clicked connect");
                  await connectAsync({ connector: connectors[i.connectorIndex] });
                  console.log("login page, finished connecting");
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
              <input type="email" className="logininputfont" onChange={(e) => setMerchantEmail(e.target.value)}></input>
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
                  onChange={(e) => setEmployeePass(e.target.value)}
                ></input>
                <div
                  className="absolute right-[16px] top-[6px] xs:top-[6px] cursor-pointer text-base xs:text-sm text-gray-700"
                  onClick={() => {
                    show ? setShow(false) : setShow(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <div
                    className={`${show ? "" : "hidden"} absolute top-[0px] xs:top-[-1px] left-[8px] xs:left-[7px] rotate-[-45deg] h-[24px] xs:h-[20px] w-[1.5px] bg-gray-700`}
                  ></div>
                </div>
              </div>
            </div>
            {/*--sign in button---*/}
            <div className="flex justify-center mt-2 ml-[75px]">
              <button type="submit" className="w-[160px] rounded-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold" onClick={employeeSubmit}>
                {isWaiting ? <SpinningCircleWhite /> : <div>Sign in</div>}
              </button>
            </div>
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
