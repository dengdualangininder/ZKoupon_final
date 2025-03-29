"use client";
// next
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
// hooks
import { useCexBalanceQuery, useNullaBalanceQuery, useCexTxnsQuery } from "../../../../../utils/hooks";
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
import { NullaInfo, AllRates } from "@/utils/types";

export default function CashOut({
  nullaInfo,
  paymentSettings,
  cashoutSettings,
  setErrorModal,
  setTradeMAXModal,
  allRates,
}: {
  nullaInfo: NullaInfo;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  setErrorModal: any;
  setTradeMAXModal: any;
  allRates: AllRates;
}) {
  console.log("/app, Cashout.tsx");

  const rates = allRates[paymentSettings.merchantCurrency];

  // hooks
  const router = useRouter();
  const t = useTranslations("App.CashOut");
  const tcommon = useTranslations("Common");
  const { data: nullaBalance, refetch: refetchNullaBalance } = useNullaBalanceQuery();
  const { data: cexBalance } = useCexBalanceQuery();
  const { data: cexTxns } = useCexTxnsQuery();

  // states
  const [isCbLinked, setIsCbLinked] = useState(true); // if Coinbase is linked or not
  const [cbEvmAddress, setCbEvmAddress] = useState("");
  const [cbAccountName, setCbAccountName] = useState("");
  const [cbBankAccountName, setCbBankAccountName] = useState("");
  const [cbOptionsModal, setCbOptionsModal] = useState(false);
  const [nullaOptionsModal, setNullaOptionsModal] = useState(false);
  const [nullaDetails, setNullaDetails] = useState(false);
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
    if (cashoutSettings.cex === "Coinbase") {
      if (isCbLinked) {
        setTransferModal("toCex");
        getCbAccountInfo();
        return;
      } else {
        setErrorModal(t("errors.linkCb"));
        return;
      }
    } else if (cashoutSettings?.cexEvmAddress) {
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
        setCbEvmAddress(resJson.data.cbEvmAddress);
        setCbAccountName(resJson.data.cbAccountName);
        return;
      }
    } catch (e) {}
    unlinkCb();
  }

  async function onClickTransferToBank() {
    setTransferModal("toBank");
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

  const onClickOutsideCexOptions = () => {
    setCbOptionsModal(false);
    document.removeEventListener("click", onClickOutsideCexOptions);
  };

  const onClickOutsideNullaOptions = () => {
    setNullaOptionsModal(false);
    document.removeEventListener("click", onClickOutsideNullaOptions);
  };

  return (
    // 96px is height of mobile top menu bar + 14px mt
    <section className="appPageContainer bg-light2 dark:bg-dark1 py-[24px] portrait:sm:py-[32px] landscape:lg:py-[32px] overflow-y-auto">
      {/* <button
        className="w-full h-[60px] bg-red-300"
        onClick={async () => {
          const receipt = await getTransactionReceipt(config, { hash: "0x6512870f8ef0cf679003d7f5577e6b803d4ee7481b7388a6d6bd87dbaef8e333" });
          const amount = formatUnits(hexToBigInt(receipt.logs[3].data), 6);
          console.log(amount);
        }}
      >
        TEST
      </button> */}
      {/*---NULLA CARD ---*/}
      <div className="cashoutCard">
        {/*--- title + more options ---*/}
        <div className="w-full h-[36px] flex justify-between items-center relative">
          {/*--- title ---*/}
          <div className="cashoutHeader">Nulla {tcommon("account")}</div>
          {/*--- more options ---*/}
          {nullaBalance && rates && (
            <div
              className={`${nullaOptionsModal ? "bg-slate-200 dark:bg-dark5" : ""} cashoutEllipsisContainer`}
              onClick={() => {
                setNullaOptionsModal(!nullaOptionsModal);
                if (!nullaOptionsModal) document.addEventListener("click", onClickOutsideNullaOptions);
              }}
            >
              <FaEllipsisVertical className="textLgAppPx" />
            </div>
          )}
          {/*--- nullaMoreOptionsModal ---*/}
          {nullaOptionsModal && (
            <div className="cashoutMoreOptionsContainer" onClick={() => setTransferModal("toAny")}>
              {t("transferToAny")}
            </div>
          )}
        </div>
        {/*--- balance ---*/}
        <CashoutBalance paymentSettings={paymentSettings} rates={rates} balance={nullaBalance} details={nullaDetails} setDetails={setNullaDetails} />
        {/*--- button ---*/}
        {nullaBalance && rates && (
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
                  className={`${cbOptionsModal ? "bg-slate-200 dark:bg-dark5" : ""} cashoutEllipsisContainer`}
                  onClick={() => {
                    setCbOptionsModal(!cbOptionsModal);
                    if (!cbOptionsModal) document.addEventListener("click", onClickOutsideCexOptions);
                  }}
                >
                  <FaEllipsisVertical className="textLgAppPx" />
                </div>
              )}
              {/*--- cexMoreOptionsModal ---*/}
              {cbOptionsModal && (
                <div className="cashoutMoreOptionsContainer" onClick={unlinkCb}>
                  {t("unlink")}
                </div>
              )}
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
            <div className="pendingCard">
              {cexTxns.pendingUsdcDeposits.map((txn, index) => (
                <div key={index} className="w-full flex justify-between">
                  <p>Pending USDC deposit</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
              {cexTxns.pendingUsdcWithdrawals.map((txn) => (
                <div className="w-full flex justify-between">
                  <p>Pending USDC withdrawal</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
              {cexTxns.pendingUsdWithdrawals.map((txn, index) => (
                <div key={index} className="w-full flex justify-between">
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
          nullaInfo={nullaInfo}
          cbEvmAddress={cbEvmAddress}
          cbAccountName={cbAccountName}
          cbBankAccountName={cbBankAccountName}
        />
      )}
      {cashoutIntroModal && paymentSettings && cashoutSettings && (
        <CashoutIntroModal paymentSettings={paymentSettings} cashoutSettings={cashoutSettings} setCashoutIntroModal={setCashoutIntroModal} setTradeMAXModal={setTradeMAXModal} />
      )}
    </section>
  );
}
