"use client";
// nextjs
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/navigation";
// wagmi
import { useConnect } from "wagmi";
// components
import ErrorModalLight from "./modals/ErrorModalLight";
// images
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { SpinningCircleWhiteLarge } from "@/utils/components/SpinningCircleWhite";

const Login = ({ isMobile, setPage, isUsabilityTest }: { isMobile: boolean; setPage: any; isUsabilityTest: boolean }) => {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [employeePass, setEmployeePass] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const [userType, setUserType] = useState("owners");
  const [moreOptionsModal, setMoreOptionsModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // hooks
  let { connectAsync, connectors } = useConnect();
  const router = useRouter();

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

  const employeeLogin = async () => {
    setIsLoggingIn(true);
    try {
      // receive jwt
      const res = await fetch("/api/employeeLogin", {
        method: "POST",
        body: JSON.stringify({ merchantEmail, employeePass }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      // if success
      if (data.status == "success") {
        console.log("employee login authenticated");
        setPage("loading");
        window.location.reload(); // trigger useEffect in page.tsx
      } else if (data.status == "error") {
        console.log("Incorrect email or password");
        setErrorModal(true);
        setErrorMsg(data.message);
      } else {
        setErrorModal(true);
        setErrorMsg("Error: Could not connect to server API");
      }
    } catch (err) {
      console.log("failed to login");
    }
    setIsLoggingIn(false);
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
    <div className="w-full h-screen font-medium text-lg portrait:sm:text-xl landscape:lg:text-xl landscape:xl:desktop:text-base flex flex-col items-center overflow-y-auto bg-light2 text-black">
      <div className="w-[320px] portrait:sm:w-[360px] landscape:lg:w-[360px] landscape:xl:desktop:w-[300px] h-full max-h-[800px] portrait:sm:max-h-[900px] landscape:lg:max-h-[900px] flex flex-col items-center my-auto">
        {/*--- logo + menu bar ---*/}
        <div className="pt-6 w-full h-[40%] min-h-[280px] landscape:lg:min-h-[300px] flex flex-col justify-end">
          {/*--- logo ---*/}
          <div className="pb-1 w-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[90px] portrait:sm:h-[100px] landscape:lg:h-[100px] landscape:xl:h-[110px] landscape:xl:desktop:h-[90px] mr-1">
              <Image src="/logo.svg" alt="logo" fill />
            </div>
            <div className="mt-8 mb-10 textBase2 text-center">Crypto payments with 0% fees</div>
          </div>

          {/*--- menu bar ---*/}
          <div className="w-full h-[52px] portrait:sm:h-[60px] landscape:lg:h-[60px] landscape:xl:desktop:h-[44px] flex items-center justify-center flex-none relative">
            <div className="absolute w-full h-[48px] portrait:sm:h-[56px] landscape:lg:h-[56px] landscape:xl:desktop:h-[40px] rounded-full shadow-[inset_4px_4px_16px_0px_rgb(84,84,84,0.20),inset_2px_2px_8px_0px_rgb(120,116,140,0.20)] bg-white bg-opacity-20"></div>
            <div
              className={`${
                userType == "owners" ? "bg-black w-[54%] drop-shadow-md text-white" : "bg-transparent text-gray-500 w-[46%]"
              } h-full cursor-pointer flex items-center justify-center rounded-full z-[1]`}
              onClick={() => setUserType("owners")}
            >
              Owners
            </div>
            <div
              className={`${
                userType == "employees" ? "bg-black w-[54%] drop-shadow-md text-white" : "bg-transparent text-gray-500 w-[46%]"
              }  h-full cursor-pointer flex items-center justify-center rounded-full z-[1]`}
              onClick={() => setUserType("employees")}
            >
              Employees
            </div>
          </div>
        </div>

        {/*--- content below MENU ---*/}
        <div className="pb-6 mt-8 w-full landscape:lg:min-h-[350px] portrait:sm:mt-12 landscape:lg:mt-10 landscape:xl:mt-10 landscape:xl:desktop:text-base">
          {/*--- FOR OWNERS ---*/}
          {userType == "owners" && (
            <div className="w-full flex flex-col space-y-6 portrait:sm:space-y-8 landscape:lg:space-y-6">
              {/*--- connectors: google, apple, line, phantom, metamask ---*/}
              {myConnectors.map<any>((i: any) => (
                <div
                  key={i.name}
                  className="w-full h-[64px] portrait:sm:h-[72px] landscape:lg:h-[72px] portrait:lg:h-[80px] landscape:xl:h-[80px] landscape:xl:desktop:h-[60px] flex items-center text-gray-700 bg-white rounded-md lg:hover:opacity-50 active:opacity-50 border border-gray-200 drop-shadow-md cursor-pointer select-none"
                  onClick={async () => {
                    // usability test
                    if (isUsabilityTest) {
                      setPage("loading");
                      await new Promise((resolve) => setTimeout(resolve, 3000));
                      setPage("intro");
                      return;
                    }

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
            <div className="px-0.5 w-full flex flex-col items-center">
              <div className="w-full">
                {/*--email---*/}
                <div className="">Email</div>
                <input type="email" className="loginInputFont" onBlur={(e) => setMerchantEmail(e.target.value)}></input>
                {/*--password---*/}
                <div className="mt-4 portrait:sm:mt-6 landscape:lg:mt-6 landscape:xl:desktop:mt-3">Password</div>
                <div className="w-full relative">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="none"
                    autoCapitalize="none"
                    className="loginInputFont"
                    onBlur={(e) => setEmployeePass(e.target.value)}
                  ></input>
                  <div className="absolute h-full right-4 top-0 flex justify-center items-center z-[2]">
                    <div
                      className="relative w-[28px] h-[28px] portrait:sm:w-[36px] portrait:sm:h-[36px] landscape:md:w-[36px] landscape:md:h-[36px] landscape:xl:desktop:w-[24px] landscape:xl:desktop:h-[24px] cursor-pointer"
                      onClick={() => {
                        show ? setShow(false) : setShow(true);
                      }}
                    >
                      <Image src={show ? "/eyesOpen.svg" : "/eyesClosed.svg"} alt="eye" fill />
                    </div>
                  </div>
                </div>
                {/*--sign in button---*/}
                <button
                  type="submit"
                  className="buttonPrimary mt-8 portrait:sm:mt-12 landscape:md:mt-10 landscape:lg:mt-12 landscape:xl:desktop:mt-8 text-white w-full flex justify-center items-center"
                  onClick={employeeLogin}
                >
                  {isLoggingIn ? <SpinningCircleWhiteLarge /> : "Sign In"}
                </button>
              </div>
              <div
                className="landscape:mt-8 portrait:mt-10 landscape:md:mt-12 portrait:sm:mt-20 text-base landscape:md:text-xl portrait:sm:text-2xl text-center link landscape:xl:desktop:text-sm"
                onClick={() => {
                  setErrorMsg("Please contact your employer. The person who created this Flash account should know the Employee Password or can set a new one.");
                  setErrorModal(true);
                }}
              >
                Forgot password?
              </div>
            </div>
          )}
        </div>
      </div>

      {/*---MODALS---*/}
      {errorModal && <ErrorModalLight errorMsg={errorMsg} setErrorModal={setErrorModal} />}

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
                  <div className="xs:text-xl">{i.name}</div>
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
