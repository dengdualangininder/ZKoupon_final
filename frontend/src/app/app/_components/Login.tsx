"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
// wagmi
import { useConnect } from "wagmi";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleGray from "@/utils/components/SpinningCircleGray";

const Login = ({ isMobile, setPage }: { isMobile: boolean; setPage: any }) => {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotModal, setForgotModal] = useState(false);
  const [modalState, setModalState] = useState("");
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState("owners");
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);

  let { connectAsync, connectors } = useConnect();

  // define myConnectors
  if (isMobile) {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
      { name: "Apple", img: "/apple.svg", connectorIndex: 2 },
    ];
  } else {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Facebook", img: "/facebook.svg", connectorIndex: 1 },
    ];
  }
  const myConnectorsMore = [
    { name: "Discord", img: "/discord.svg", connectorIndex: 3 },
    { name: "Telegram", img: "/telegram.svg", connectorIndex: 4 },
    { name: "Line", img: "/line.svg", connectorIndex: 4 },
  ];

  const employeeSubmit = async () => {
    try {
      //fetch doc
      console.log("employeeSubmit()");
      const res = await fetch("/api/employeeLogin", {
        method: "POST",
        body: JSON.stringify({ merchantEmail, employeePass }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      // if success
      if (data.status == "success") {
        console.log("login successful");
        setPage("loading");
      } else {
        console.log("failed to login");
        setPage("login");
      }
    } catch (err) {
      console.log("failed to login");
      setPage("login");
    }
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
    //   }xs:w-[90%] sm:w-[540px]
  };

  return (
    <div className="w-full h-screen py-8 textLg flex justify-center overflow-y-auto">
      <div className="w-[320px] portrait:sm:w-[360px] landscape:lg:w-[360px] portrait:lg:w-[430px] landscape:xl:w-[430px] landscape:xl:desktop:w-[360px] h-full">
        {/*--- HEADER + MENU BAR ---*/}
        <div className="w-full h-[40%] min-h-[240px] landscape:lg:min-h-[300px] flex flex-col justify-end landscape:space-y-8 landscape:md:space-y-10 landscape:lg:space-y-12 portrait:space-y-12 portrait:sm:space-y-20">
          {/*--- logo ---*/}
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full h-[90px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:h-[110px] landscape:xl:desktop:h-[90px] mr-1">
              <Image src="/logo.svg" alt="logo" fill />
            </div>
          </div>
          {/*--- subheader ---*/}
          <div className="pb-2 textBase2 font-medium text-center">Fast global payments with 0% fees</div>
          {/*--- menu bar ---*/}
          <div className="w-full h-[50px] portrait:sm:h-[60px] landscape:lg:h-[60px] portrait:lg:h-[64px] landscape:xl:h-[64px] landscape:xl:desktop:h-[50px] flex justify-center font-medium bg-gray-200 rounded-full flex-none">
            <div
              className={`${userType == "owners" ? "bg-blue-500 text-white" : ""} w-[50%] h-full cursor-pointer flex items-center justify-center rounded-full`}
              onClick={() => setUserType("owners")}
            >
              Owners
            </div>
            <div
              className={`${userType == "employees" ? "bg-blue-500 text-white" : "text-gray-700"} w-[50%] h-full cursor-pointer flex items-center justify-center rounded-full`}
              onClick={() => setUserType("employees")}
            >
              Employees
            </div>
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="mt-8 h-[50%] min-h-[250px] landscape:lg:min-h-[350px] portrait:sm:mt-12 landscape:lg:mt-10 landscape:xl:mt-10 landscape:xl:desktop:text-base">
          {/*--- FOR OWNERS ---*/}
          {userType == "owners" && (
            <div className="w-full flex flex-col space-y-5 portrait:sm:space-y-8 landscape:lg:space-y-6 portrait:lg:space-y-8 landscape:xl:space-y-8">
              {/*--- connectors: google, apple, line, phantom, metamask ---*/}
              {myConnectors.map<any>((i: any) => (
                <div
                  key={i.name}
                  className="w-full h-[60px] portrait:sm:h-[72px] landscape:lg:h-[72px] portrait:lg:h-[80px] landscape:xl:h-[80px] landscape:xl:desktop:h-[60px] flex items-center text-gray-700 bg-white rounded-md font-medium lg:hover:opacity-50 active:opacity-50 border border-gray-200 drop-shadow-md cursor-pointer select-none"
                  onClick={async () => {
                    // usability test
                    setPage("loading");
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    setPage("app");
                    return;

                    console.log("login page, clicked connect, set page to Loading");
                    setPage("loading");
                    await connectAsync({ connector: connectors[i.connectorIndex] });
                    console.log("login page, finished connecting");
                  }}
                >
                  <div className="relative ml-7 mr-4 w-[40px] h-[32px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div>Sign in with {i.name}</div>
                </div>
              ))}
            </div>
          )}

          {/*--FOR EMPLOYEES---*/}
          {userType == "employees" && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full">
                {/*--email---*/}
                <div className="font-medium">Email</div>
                <input type="email" className="loginInputFont" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
                {/*--password---*/}
                <div className="mt-4 portrait:sm:mt-6 landscape:lg:mt-6 landscape:xl:desktop:mt-3 font-medium">Password</div>
                <div className="w-full relative">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="none"
                    autoCapitalize="none"
                    className="loginInputFont"
                    onBlur={(e) => setEmployeePass(e.target.value)}
                  ></input>
                  <div className="absolute w-[68px] portrait:sm:w-[100px] landscape:md:w-[100px] h-full right-0 top-0 flex justify-center items-center">
                    <div
                      className="relative w-[28px] h-[28px] portrait:sm:w-[38px] portrait:sm:h-[38px] landscape:md:w-[38px] landscape:md:h-[38px] pointer-cursor"
                      onClick={() => {
                        show ? setShow(false) : setShow(true);
                      }}
                    >
                      <Image src={show ? "/eyesOpen.svg" : "/eyesClosed.svg"} alt="eye" fill />
                    </div>
                  </div>
                </div>
                {/*--sign in button---*/}
                <div className="mt-8 portrait:sm:mt-12 landscape:md:mt-10 landscape:lg:mt-12 landscape:xl:desktop:mt-8 flex justify-center">
                  <button
                    type="submit"
                    className="w-full h-[56px] landscape:md:h-[64px] portrait:sm:h-[64px] landscape:xl:desktop:h-[56px] text-white font-medium bg-blue-500 border-2 border-blue-500 lg:hover:opacity-50 active:opacity-50 rounded-[4px]"
                    onClick={employeeSubmit}
                  >
                    Sign in
                  </button>
                </div>
              </div>
              <div
                className="landscape:mt-8 portrait:mt-12 landscape:md:mt-12 portrait:sm:mt-20 text-base landscape:md:text-xl portrait:sm:text-2xl text-center link landscape:xl:desktop:text-base"
                onClick={() => {
                  setForgotModal(true);
                  setModalState("initial");
                }}
              >
                Forgot password?
              </div>
            </div>
          )}
        </div>
      </div>

      {/*---MODALS---*/}
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
      {moreOptionsModal && (
        <div className="">
          <div className="w-[340px] h-[360px] flex flex-col items-center justify-between px-6 py-10 bg-white rounded-xl border border-slate-500 fixed inset-1/2 -translate-y-[55%] -translate-x-1/2 z-[90]">
            {/*---title---*/}
            <div className="text-xl font-bold">Choose A Sign In Method</div>
            {/*---grid options---*/}
            <div className="w-full mt-8 grid grid-cols-3 gap-2">
              {myConnectorsMore.map<any>((i: any) => (
                <div
                  key={i.name}
                  className="flex flex-col items-center"
                  onClick={async () => {
                    console.log("login page, clicked connect, set page to Loading");
                    setPage("loading");
                    await connectAsync({ connector: connectors[i.connectorIndex] });
                    console.log("login page, finished connecting");
                  }}
                >
                  <div className="relative w-[40px] h-[36px]">
                    <Image src={i.img} alt={i.name} fill />
                  </div>
                  <div className="xs:text-xl font-medium">{i.name}</div>
                </div>
              ))}
            </div>
            {/*---close button---*/}
            <button
              onClick={() => setMoreOptionsModal(false)}
              className="mt-8 text-xl font-bold w-[160px] py-3 bg-white border border-gray-200 rounded-full tracking-wide drop-shadow-md"
            >
              CLOSE
            </button>
          </div>
          <div className="modalBlackout"></div>
        </div>
      )}
    </div>
  );
};

export default Login;
