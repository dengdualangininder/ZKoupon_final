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
    <div className="h-screen flex flex-col items-center justify-center xs:py-4 overflow-y-auto text-gray-800">
      {/*--- container (with borders for desktop) ---*/}
      <div
        className={`w-full h-screen xs:h-[800px] px-6 xs:w-[90%] sm:w-[540px] ${
          isMobile ? "" : ""
        } flex flex-col items-center xs:rounded-2xl border-slate-300 xs:border-4  overflow-y-auto`}
      >
        {/*--- spacer ---*/}
        <div className="w-full h-[5%] xs:h-[3%]"></div>

        {/*--- HEADER ---*/}
        <div className="w-full pb-2 flex flex-col items-center">
          <div className={`mt-2 relative w-[220px] h-[88px] mr-1 ${isMobile ? "" : ""}`}>
            <Image src="/logo.svg" alt="logo" fill />
          </div>
          <div className="mt-2 tracking-tight font-medium text-base xs:text-lg text-center">Fast global payments with 0% fees</div>
        </div>

        {/*--- spacer ---*/}
        <div className="w-full h-[5%]"></div>

        {/*--- OWNERS or EMPLOYEES ---*/}
        <div className="w-full flex justify-center text-lg xs:text-xl font-bold">
          <div className="flex space-x-12">
            <div className={`${role == "owners" ? "underline underline-offset-4" : "text-gray-400"} cursor-pointer`} onClick={() => setRole("owners")}>
              FOR OWNERS
            </div>
            <div className={`${role == "employees" ? "underline underline-offset-4" : "text-gray-400"} cursor-pointer`} onClick={() => setRole("employees")}>
              FOR EMPLOYEES
            </div>
          </div>
        </div>

        {/*--- spacer ---*/}
        <div className="w-full h-[3%] xs:h-[5%]"></div>

        {/*--- FOR OWNERS ---*/}
        {role == "owners" && (
          <div className="pt-3 pb-10 w-full px-[calc((100%-360px)/2)] xs:w-[380px] xs:px-0 flex flex-col space-y-4 xs:space-y-5">
            {/*--- connectors: google, apple, line, phantom, metamask ---*/}
            {myConnectors.map<any>((i: any) => (
              <div
                key={i.name}
                className="w-full py-4 xs:py-5 flex items-center text-gray-500 bg-white rounded-full font-bold lg:hover:bg-gray-100 active:bg-gray-100 cursor-pointer border border-gray-300 drop-shadow-md"
                onClick={async () => {
                  console.log("login page, clicked connect, set page to Loading");
                  setPage("loading");
                  await connectAsync({ connector: connectors[i.connectorIndex] });
                  console.log("login page, finished connecting");
                }}
              >
                <div className="relative ml-7 mr-4 w-[40px] h-[36px]">
                  <Image src={i.img} alt={i.name} fill />
                </div>
                <div className="xs:text-xl">Sign in with {i.name}</div>
              </div>
            ))}
            <div className="pt-2 xs:pt-4 xs:text-xl link text-center font-bold">More options{isMobile}</div>
          </div>
        )}

        {/*--FOR EMPLOYEES---*/}
        {role == "employees" && (
          <div className="w-full py-2 xs:px-0 flex flex-col items-center">
            <form className="w-[320px] xs:w-[360px] flex flex-col">
              {/*--email---*/}
              <label className="text-lg xs:text-xl leading-snug font-medium">Email</label>
              <input
                type="email"
                className="mt-0.5 text-lg xs:text-xl font-bold px-1.5 py-2 xs:py-3 border border-gray-300 rounded-md outline-gray-300 focus:outline-blue-500 transition-[outline-color] duration-[400ms]"
                onChange={(e) => setMerchantEmail(e.target.value)}
              ></input>
              {/*--password---*/}
              <label className="mt-4 text-lg xs:text-xl leading-snug font-medium">Password</label>
              <div className="w-full relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="none"
                  autoCapitalize="none"
                  className="w-full mt-0.5 text-lg xs:text-xl font-bold px-1.5 py-2 xs:py-3 border border-gray-300 rounded-md outline-gray-300 focus:outline-blue-500 transition-[outline-color] duration-[400ms]"
                  onChange={(e) => setEmployeePass(e.target.value)}
                ></input>
                <div
                  className="absolute right-[16px] xs:right-[18px] top-[10px] xs:top-[12px] cursor-pointer text-xl xs:text-2xl"
                  onClick={() => {
                    show ? setShow(false) : setShow(true);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} />
                  <div
                    className={`${
                      show ? "hidden" : ""
                    } absolute top-[0px] xs:top-[-1px] left-[10px] xs:left-[11px] rotate-[-45deg] h-[30px] xs:h-[34px] w-[2px] xs:w-[3px] rounded-full bg-gray-800`}
                  ></div>
                </div>
              </div>
              {/*--sign in button---*/}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="w-[260px] xs:w-[280px] text-xl rounded-full py-4 xs:py-5 bg-blue-500 hover:bg-blue-600 active:bg-blue-400 text-white font-bold"
                  onClick={employeeSubmit}
                >
                  Sign in
                </button>
              </div>
            </form>
            <div
              className="mt-12 pb-10 text-base xs:text-xl text-center link"
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
