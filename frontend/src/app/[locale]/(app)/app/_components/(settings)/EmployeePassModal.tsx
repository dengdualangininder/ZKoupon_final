import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useW3Info } from "../../../Web3AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
// utils
import { fetchPost } from "@/utils/functions";
import { FaAngleLeft, FaCircleCheck } from "react-icons/fa6";
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import Spinner from "@/utils/components/Spinner";

export default function EmployeePassModal({ setEmployeePassModal, setErrorModal, isEmployeePass }: { setEmployeePassModal: any; setErrorModal: any; isEmployeePass: boolean }) {
  // hooks
  const t = useTranslations("App.Settings");
  const tcommon = useTranslations("Common");
  const w3Info = useW3Info();
  const passwordInputRef1 = useRef<HTMLInputElement | null>(null); // focus input when eye is clicked
  const passwordInputRef2 = useRef<HTMLInputElement | null>(null); // focus input when eye is clicked
  const queryClient = useQueryClient();

  //states
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [errors, setErrors] = useState({ password1: "", password2: "" });
  const [status, setStatus] = useState("initial"); // initial | pending | changed | removed

  async function validatePassword1() {
    if (password1) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // at least 8 chars, one upper, one lower, one number
      const isValid = regex.test(password1);
      if (!isValid) {
        setErrors((errors) => ({ ...errors, password1: "Must be \u2265 8 characters and contain a lowercase letter, an uppercase letter, and a number" }));
        return;
      }
    }
    setErrors((errors) => ({ ...errors, password1: "" })); // if empty, don't show error
  }

  function validatePassword2() {
    if (password2) {
      if (password1 !== password2) {
        setErrors((errors) => ({ ...errors, password2: "Password does not match" }));
        return;
      }
    }
    setErrors((errors) => ({ ...errors, password2: "" })); // need prev as validatePassword1/2 runs at same time
  }

  const submit = async (type: string) => {
    if (type === "change") {
      if (!password1 || !password2 || errors.password1 || errors.password2) return; // !password1/2 needed because no prior validation if empty password
    }
    setStatus("pending");
    try {
      const resJson = await fetchPost("/api/saveEmployeePass", { employeePass: type === "change" ? password1 : "", w3Info });
      if (resJson === "saved") {
        type === "change" ? setStatus("changed") : setStatus("removed");
        return;
      }
    } catch (e) {}
    setStatus("initial");
    setPassword1("");
    setPassword2("");
    setErrorModal("Error when updating");
  };

  return (
    <div>
      <div className="fullModal">
        {/*--- CLOSE/BACK BUTTON ---*/}
        {status === "initial" && (
          <>
            {/*--- tablet/desktop close ---*/}
            <div className="xButtonContainer" onClick={() => setEmployeePassModal(false)}>
              <div className="xButton">&#10005;</div>
            </div>
            {/*--- mobile back ---*/}
            <FaAngleLeft className="mobileBack" onClick={() => setEmployeePassModal(false)} />
          </>
        )}

        {/*--- header ---*/}
        <div className="fullModalHeader">{isEmployeePass ? t("employeePassModal.changeTitle") : t("employeePassModal.addTitle")}</div>

        {/*--- content ---*/}
        <div className="fullModalContentContainer scrollbar">
          <div className="fullModalContentContainer2 max-w-[480px] desktop:max-w-[430px] gap-[44px] desktop:gap-[36px]!">
            {status === "initial" && (
              <>
                {/*--password1---*/}
                <div className="mt-[40px]">
                  <div className="appInputLabel">New Password</div>
                  <div className="w-full relative">
                    <input
                      className={`appInput pr-[42px] w-full peer ${errors.password1 ? "border-red-500! !focus:border-red-500" : ""}`}
                      ref={passwordInputRef1}
                      type={show ? "text" : "password"}
                      autoComplete="none"
                      autoCapitalize="none"
                      onBlur={() => {
                        setTimeout(() => {
                          if (passwordInputRef1.current !== document.activeElement) {
                            validatePassword1();
                            validatePassword2();
                          }
                        }, 100);
                      }}
                      onChange={(e) => setPassword1(e.currentTarget.value)}
                      value={password1}
                      disabled={status === "initial" ? false : true}
                    ></input>
                    <div
                      className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-lightText1 [transition:color_500ms]"
                      onClick={() => {
                        if (passwordInputRef1.current) {
                          setShow(!show);
                          passwordInputRef1.current.focus();
                          const end = passwordInputRef1.current.value.length;
                          setTimeout(() => {
                            passwordInputRef1.current?.setSelectionRange(end, end);
                          }, 10);
                        }
                      }}
                    >
                      {show ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
                    </div>
                    {errors.password1 && <p className="loginError">{errors.password1}</p>}
                  </div>
                </div>
                {/*--- password2 ---*/}
                <div>
                  <div className="appInputLabel">Repeat New Password</div>
                  <div className="w-full relative">
                    <input
                      className={`appInput pr-[42px] w-full peer ${errors.password2 ? "border-red-500! !focus:border-red-500" : ""}`}
                      ref={passwordInputRef2}
                      type={show2 ? "text" : "password"}
                      autoComplete="none"
                      autoCapitalize="none"
                      onBlur={() => {
                        setTimeout(() => {
                          if (passwordInputRef2.current !== document.activeElement) {
                            validatePassword2();
                          }
                        }, 100);
                      }}
                      onChange={(e) => setPassword2(e.target.value)}
                      value={password2}
                      disabled={status === "initial" ? false : true}
                    ></input>
                    <div
                      className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-lightText1 [transition:color_500ms]"
                      onClick={() => {
                        if (passwordInputRef2.current) {
                          setShow2(!show2);
                          passwordInputRef2.current.focus();
                          const end = passwordInputRef2.current.value.length;
                          setTimeout(() => {
                            passwordInputRef2.current?.setSelectionRange(end, end);
                          }, 10);
                        }
                      }}
                    >
                      {show2 ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
                    </div>
                    {errors.password2 && <p className="loginError">{errors.password2}</p>}
                  </div>
                </div>

                {/*---buttons---*/}
                <div className="py-[20px]">
                  <button className="appButton1 w-full" onClick={() => submit("change")}>
                    {isEmployeePass && t("employeePassModal.changeButton")}
                    {!isEmployeePass && t("employeePassModal.addButton")}
                  </button>
                </div>

                {/*--- remove ---*/}
                {isEmployeePass && (
                  <div className="flex-1 flex items-end pb-[16px]">
                    <button className="appButtonRed w-full" onClick={() => submit("remove")}>
                      {t("employeePassModal.removeButton")}
                    </button>
                  </div>
                )}
              </>
            )}

            {status !== "initial" && (
              <div className="h-full max-h-[500px] min-h-[300px] flex flex-col items-center justify-center gap-[120px]">
                {status === "pending" ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="flex items-center gap-[12px]">
                      <FaCircleCheck className="inline-block text-green-500 text-[1.4em]" />
                      {status === "changed" ? (isEmployeePass ? t("employeePassModal.changeMsg") : t("employeePassModal.addMsg")) : t("employeePassModal.removeMsg")}
                    </div>
                    <button
                      className="appButton1 w-full"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["settings"] }); // do this at end to keep old isEmployeePass state
                        setEmployeePassModal(false);
                      }}
                    >
                      {tcommon("close")}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
