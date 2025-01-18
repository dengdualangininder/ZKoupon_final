"use client";
// next
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
// hooks
import { useRatesQuery, useCexBalanceQuery, useFlashBalanceQuery, useCexTxnsQuery } from "../../hooks";
// wagmi & viem & ethers
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
// other
import { v4 as uuidv4 } from "uuid";
// i18n
import { useTranslations } from "next-intl";
// components
import CashoutIntroModal from "./modals/CashoutIntroModal";
import TransferModal from "./(cashout)/TransferModal";
import CashoutBalance from "./(cashout)/CashoutBalance";

// images
import { FaEllipsisVertical } from "react-icons/fa6";
// types
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";
import { FlashInfo } from "@/utils/types";

export default function CashOut({
  flashInfo,
  paymentSettings,
  cashoutSettings,
  setErrorModal,
  setTradeMAXModal,
}: {
  flashInfo: FlashInfo;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  setErrorModal: any;
  setTradeMAXModal: any;
}) {
  console.log("/app, Cashout.tsx");

  // hooks
  const router = useRouter();
  const account = useAccount();
  const t = useTranslations("App.CashOut");
  const tcommon = useTranslations("Common");
  const { data: rates } = useRatesQuery(paymentSettings?.merchantCurrency);
  const { data: flashBalance, refetch: refetchFlashBalance } = useFlashBalanceQuery();
  const { data: cexBalance } = useCexBalanceQuery();
  const { data: cexTxns } = useCexTxnsQuery();
  console.log(cexTxns);
  // TODO: somewhow set flashBalance and cexBalance for usability test

  // states
  const [isCbLinked, setIsCbLinked] = useState(true); // if Coinbase is linked or not
  const [cbEvmAddress, setCbEvmAddress] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState("");
  const [cexMoreOptions, setCexMoreOptions] = useState(false);
  const [flashMoreOptions, setFlashMoreOptions] = useState(false);
  const [flashDetails, setFlashDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [transferModal, setTransferModal] = useState<"toCex" | "toBank" | "toAny" | null>(null);
  const [cashoutIntroModal, setCashoutIntroModal] = useState(false);

  useEffect(() => {
    console.log("/app, Cashout.tsx, useEffect");
    // show cashoutIntroModal or not
    const isCashoutIntroModal = window.localStorage.getItem("cashoutIntroModal");
    if (isCashoutIntroModal) setCashoutIntroModal(true);
    // determine if Coinbase linked
    window.localStorage.getItem("cbRefreshToken") ? setIsCbLinked(true) : setIsCbLinked(false);
  }, []);

  const linkCb = async () => {
    const cbRandomSecure = uuidv4() + "SUBSTATEcashOut";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/cbAuth`);
    const scopeBase =
      "wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read,wallet:withdrawals:read,wallet:trades:read,wallet:transactions:read";
    const scope = paymentSettings?.merchantCurrency === "USD" ? scopeBase + ",wallet:buys:create" : scopeBase;
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=${scope}`
    );
  };

  const unlinkCb = () => {
    window.sessionStorage.removeItem("cbAccessToken");
    window.localStorage.removeItem("cbRefreshToken");
    setIsCbLinked(false);
    setTransferModal(null);
  };

  const onClickTransferToCex = async () => {
    // if coinbase
    if (cashoutSettings.cex === "Coinbase" && paymentSettings.merchantCountry != "Other") {
      if (isCbLinked) {
        setTransferModal("toCex");
        getCbAccountInfo();
        return;
      } else {
        setErrorModal(t("errors.linkCb"));
        return;
      }
    }

    // if not coinbase
    if (cashoutSettings?.cexEvmAddress) {
      setTransferModal("toCex");
    } else {
      setErrorModal(
        t.rich("errors.platformAddress", {
          span1: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
          span2: (chunks) => <span className="font-semibold dark:font-bold">{chunks}</span>,
          span3: (chunks) => (
            <span
              className="link"
              onClick={() => {
                setTransferModal("toAny");
                setErrorModal(null);
              }}
            >
              {chunks}
            </span>
          ),
          icon: () => <FaEllipsisVertical className="inline-block" />,
          span4: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
        })
      );
    }
  };

  async function getCbAccountInfo() {
    const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
    const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
    try {
      const res = await fetch("/api/cbGetAccountInfo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cbAccessToken, cbRefreshToken }),
      });
      const resJson = await res.json();
      if (resJson.status === "success") {
        if (resJson.data.newAccessToken) {
          window.sessionStorage.setItem("cbAccessToken", resJson.data.newAccessToken);
          window.localStorage.setItem("cbRefreshToken", resJson.data.newRefreshToken);
        }
        console.log("cbEvmAddress:", resJson.data.cbEvmAddress);
        setCbEvmAddress(resJson.data.cbEvmAddress);
        return;
      }
    } catch (e) {}
    unlinkCb();
  }

  async function onClickTransferToBank() {
    setTransferModal("toBank");

    // usability test
    if (flashInfo.isUsabilityTest) {
      setCbBankAccountName("Chase Bank, North America\n****9073");
      return;
    }

    const cbAccessToken = window?.sessionStorage.getItem("cbAccessToken") ?? "";
    const cbRefreshToken = window?.localStorage.getItem("cbRefreshToken") ?? "";
    try {
      const res = await fetch("/api/cbGetBankInfo", {
        method: "POST",
        body: JSON.stringify({ cbRefreshToken, cbAccessToken }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        if (data.newAccessToken) {
          window.sessionStorage.setItem("cbAccessToken", data.newAccessToken);
          window.localStorage.setItem("cbRefreshToken", data.newRefreshToken);
        }
        setCbBankAccountName(data.cbBankAccountName);
        return;
      }
    } catch (e) {
      setErrorModal("Error");
      setTransferModal(null);
    }
  }

  const hideCexMoreOptions = () => {
    setCexMoreOptions(false);
    document.removeEventListener("click", hideCexMoreOptions);
  };

  const hideFlashMoreOptions = () => {
    setFlashMoreOptions(false);
    document.removeEventListener("click", hideFlashMoreOptions);
  };

  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="appPageContainer bg-light2 dark:bg-dark1 py-[24px] portrait:sm:py-[32px] landscape:lg:py-[32px] overflow-y-auto">
      {/*---FLASH CARD ---*/}
      <div className="cashoutCard">
        {/*--- title + more options ---*/}
        <div className="w-full h-[36px] flex justify-between items-center relative">
          {/*--- title ---*/}
          <div className="cashoutHeader">Flash {tcommon("account")}</div>
          {/*--- more options ---*/}
          {flashBalance && rates && (
            <div
              className={`${flashMoreOptions ? "bg-slate-200 dark:bg-dark5" : ""} cashoutEllipsisContainer`}
              onClick={() => {
                setFlashMoreOptions(!flashMoreOptions);
                if (!flashMoreOptions) document.addEventListener("click", hideFlashMoreOptions);
              }}
            >
              <FaEllipsisVertical className="textLgAppPx" />
            </div>
          )}
          {/*--- flashMoreOptionsModal ---*/}
          <div className={`${flashMoreOptions ? "visible opacity-100" : "invisible opacity-0"} cashoutMoreOptionsContainer`} onClick={() => setTransferModal("toAny")}>
            {t("transferToAny")}
          </div>
        </div>
        {/*--- balance ---*/}
        <CashoutBalance paymentSettings={paymentSettings} rates={rates} balance={flashBalance} details={flashDetails} setDetails={setFlashDetails} />
        {/*--- button ---*/}
        {flashBalance && rates && (
          <button className="cashoutButton" onClick={onClickTransferToCex}>
            {cashoutSettings.cex ? tcommon("transferToCEX", { cex: cashoutSettings.cex }) : tcommon("transfer")}
          </button>
        )}
      </div>

      {/*--- CEX CARD ---*/}
      {cashoutSettings?.cex === "Coinbase" && paymentSettings?.merchantCountry != "Other" && (
        <div className="w-full flex flex-col items-center mt-[24px] portrait:sm:mt-[32px] landscape:lg:mt-[32px]">
          <div className="cashoutCard">
            {/*--- title + more options ---*/}
            <div className="w-full h-[36px] flex justify-between items-center relative">
              {/*--- title ---*/}
              <div className="cashoutHeader">Coinbase {tcommon("account")}</div>
              {/*--- ellipsis ---*/}
              {isCbLinked && cexBalance && rates && (
                <div
                  className={`${cexMoreOptions ? "bg-slate-200 dark:bg-dark5" : ""} cashoutEllipsisContainer`}
                  onClick={() => {
                    setCexMoreOptions(!cexMoreOptions);
                    if (!cexMoreOptions) document.addEventListener("click", hideCexMoreOptions);
                  }}
                >
                  <FaEllipsisVertical className="textLgAppPx" />
                </div>
              )}
              {/*--- cexMoreOptionsModal ---*/}
              <div className={`${cexMoreOptions ? "visible opacity-100" : "invisible opacity-0"} cashoutMoreOptionsContainer`} onClick={unlinkCb}>
                {t("unlink")}
              </div>
            </div>
            {/*--- balance ---*/}
            {isCbLinked ? (
              <CashoutBalance paymentSettings={paymentSettings} rates={rates} balance={cexBalance} details={cexDetails} setDetails={setCexDetails} />
            ) : (
              <div className="flex-1 w-full flex justify-center items-center">
                <span className="link" onClick={linkCb}>
                  {t("linkCoinbase")}
                </span>
              </div>
            )}
            {/*--- button ---*/}
            {isCbLinked && cexBalance && rates && (
              <button className="cashoutButton" onClick={onClickTransferToBank}>
                {tcommon("transferToBank")}
              </button>
            )}
          </div>
          {/*--- pending transactions ---*/}
          {isCbLinked && cexTxns && (cexTxns.pendingUsdWithdrawals.length > 0 || cexTxns.pendingUsdcDeposits.length > 0 || cexTxns.pendingUsdcWithdrawals.length > 0) && (
            <div className="text-base pendingCard">
              {cexTxns.pendingUsdcDeposits.map((txn) => (
                <div className="w-full flex justify-between">
                  <p>Pending USDC deposit</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
              {/* {cexTxns.pendingUsdcWithdrawals.map((txn) => (
                <div className="w-full flex justify-between">
                  <p>Pending USDC withdrawal</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))} */}
              {cexTxns.pendingUsdWithdrawals.map((txn) => (
                <div className="w-full flex justify-between">
                  <p>Pending USD withdrawal</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {transferModal && (
        <TransferModal
          transferModal={transferModal}
          setTransferModal={setTransferModal}
          paymentSettings={paymentSettings}
          cashoutSettings={cashoutSettings}
          rates={rates}
          setErrorModal={setErrorModal}
          flashInfo={flashInfo}
          cbEvmAddress={cbEvmAddress}
          cbBankAccountName={cbBankAccountName}
        />
      )}
      {cashoutIntroModal && paymentSettings && cashoutSettings && (
        <CashoutIntroModal paymentSettings={paymentSettings} cashoutSettings={cashoutSettings} setCashoutIntroModal={setCashoutIntroModal} setTradeMAXModal={setTradeMAXModal} />
      )}
    </section>
  );
}
