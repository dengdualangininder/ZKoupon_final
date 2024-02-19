"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import SpinningCircleWhite from "../../_utils/components/SpinningCircleWhite";
import SpinningCircleGray from "../../_utils/components/SpinningCircleGray";

export default function Login() {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [modalState, setModalState] = useState(""); // initial, sending, sent
  const [show, setShow] = useState(false);

  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsWaiting(true);
    await axios
      .post(
        process.env.ISDEV == "true" ? "http://localhost:8080/api/login" : "https://server.lingpay.io/login",
        { merchantEmail: merchantEmail, password: password },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data === "match") {
          router.push("/app");
        } else if (res.data === "nomatch") {
          setErrorModal(true);
          setErrorMsg("Email/password incorrect");
        } else {
          setErrorModal(true);
          setErrorMsg("Internal server error");
        }
      })
      .catch(() => {
        setErrorModal(true);
        setErrorMsg("Server request error");
      });
    setIsWaiting(false);
  };

  const sendLink = async () => {
    // const merchantEmail = document.getElementById("forgotModalInput").value;
    if (merchantEmail.includes("@") && merchantEmail.split("@")[1].includes(".")) {
      setModalState("sending");
      await axios
        .post("https://server.lingpay.io/forgot", { merchantEmail: merchantEmail }, { withCredentials: true })
        .then((res) => {
          if (res.data === "sent") {
            setModalState("sent");
          } else if (res.data === "no user") {
            setErrorModal(true);
            setErrorMsg("Email does not match with any account");
            setModalState("initial");
          } else {
            setErrorModal(true);
            setErrorMsg("Internal server error");
            setModalState("initial");
          }
        })
        .catch((e) => {
          setErrorModal(true);
          setErrorMsg("Server request error");
          setModalState("initial");
        });
    } else {
      setErrorModal(true);
      setErrorMsg("Please enter a valid email");
      setModalState("initial");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center xs:justify-center font-nunito">
      {/*--container---*/}
      <div className="px-8 w-full xs:w-[356px] h-[80%] xs:h-[480px] flex flex-col items-center justify-evenly xs:rounded-2xl border-slate-300 xs:border-4">
        {/*--logo---*/}
        <div className="flex items-center">
          <div className="w-[100px] xs:w-[120px] relative">
            <Image src="/logo.svg" objectFit="contain" alt="logo" width={150} height={150} />
          </div>
        </div>
        {/*--heading---*/}
        <div className="flex items-center">
          <div className="font-bold text-3xl xs:text-2xl leading-none text-center">Sign in to Ling Pay</div>
        </div>
        {/*--form---*/}
        <form id="loginForm" className="flex flex-col justify-center w-full">
          <label className="font-bold text-lg xs:text-base">Email</label>
          <input type="email" className="logininputfont" onChange={(e) => setMerchantEmail(e.target.value)}></input>
          <div className="mt-4 font-bold relative">Password</div>
          <div className="w-full relative">
            <input
              type={show ? "text" : "password"}
              autoComplete="none"
              autoCapitalize="none"
              className="logininputfont w-full"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
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
            <button className="w-4/5 flex justify-center items-center loginbutton" onClick={submit}>
              {isWaiting ? <SpinningCircleWhite /> : <div>Sign in</div>}
            </button>
          </div>
        </form>
        {/*--links---*/}
        <div className="text-center text-lg xs:text-base font-bold">
          <Link href="/signup" className="link">
            Create a new account
          </Link>
          {/*--forgot password---*/}
          <div
            className="mt-6 xs:mt-3 link"
            onClick={() => {
              setForgotModal(true);
              setModalState("initial");
            }}
          >
            I forgot my password
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
                <button onClick={sendLink} className="w-4/5 xs:w-[150px] flex justify-center items-center loginbutton">
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
}
