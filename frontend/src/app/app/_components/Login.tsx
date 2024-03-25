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
  const [role, setRole] = useState("owners");

  let { connectAsync, connectors } = useConnect();

  // define myConnectors
  if (isMobile) {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Apple", img: "/apple.svg", connectorIndex: 1 },
      { name: "Line", img: "/line.svg", connectorIndex: 2 },
      { name: "MetaMask", img: "/metamask.svg", connectorIndex: 3 },
    ];
  } else {
    var myConnectors = [
      { name: "Google", img: "/google.svg", connectorIndex: 0 },
      { name: "Line", img: "/line.svg", connectorIndex: 2 },
      { name: "MetaMask", img: "/metamask.svg", connectorIndex: 3 },
    ];
  }

  const employeeSubmit = async () => {
    // e.preventDefault();
    console.log("employee submit clicked");
    setPage("loading");

    // check if matched. If so, return doc.transactions
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // setAdmin(false);
    // setPage("app");

    // if error, return to Login
    setPage("login");

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
    <div className="min-h-screen flex flex-col items-center justify-center xs:py-4">
      {/*--- container (with borders for desktop) ---*/}
      <div className="w-full h-screen px-6 py-8 xs:px-8 xs:w-[440px] xs:h-[600px] flex flex-col items-center xs:rounded-2xl border-slate-300 xs:border-4">
        {/*--- heading ---*/}
        <div className="relative w-[300px] h-[100px]">
          <Image src="/logo.svg" alt="logo" fill />
        </div>
        <div className="mt-3 xs:mt-2 font-bold text-gray-600">Fast global payments with near-zero fees</div>

        {/*--- OWNERS or EMPLOYEES ---*/}
        <div className="mt-10 space-x-12 flex text-lg xs:text-base font-bold">
          <div className={`${role == "owners" ? "text-gray-800 underline underline-offset-4" : "text-gray-400"} cursor-pointer`} onClick={() => setRole("owners")}>
            FOR OWNERS
          </div>
          <div className={`${role == "employees" ? "text-gray-800 underline underline-offset-4" : "text-gray-400"} cursor-pointer`} onClick={() => setRole("employees")}>
            FOR EMPLOYEES
          </div>
        </div>

        {/*--- FOR OWNERS ---*/}
        {role == "owners" && (
          <div className="mt-12 w-full px-[calc((100%-360px)/2)] flex flex-col items-center space-y-4">
            {/*--- connectors: google, apple, line, phantom, metamask ---*/}
            {myConnectors.map<any>((i: any) => (
              <div
                key={i.name}
                className="w-full px-6 flex items-center bg-white rounded-full pl-8 py-4 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-300 drop-shadow-md"
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
                <div className="ml-4">Sign in with {i.name}</div>
              </div>
            ))}
          </div>
        )}

        {/*--FOR EMPLOYEES---*/}
        {role == "employees" && (
          <div className="mt-8 w-full">
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
                  Sign in
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
        )}
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
    </div>
  );
};

export default Login;
