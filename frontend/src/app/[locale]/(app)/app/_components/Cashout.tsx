"use client";
// next
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
// others
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
// components
import CashoutIntroModal from "./modals/CashoutIntroModal";
import TransferModal from "./(cashout)/TransferModal";
import CashoutBalance from "./(cashout)/CashoutBalance";
// images
import { FaEllipsisVertical } from "react-icons/fa6";
// utils
import { useCbBalanceQuery, useCbTxnsQuery, useNullaBalanceQuery } from "@/utils/hooks";
import { PaymentSettings, CashoutSettings } from "@/db/UserModel";
import { NullaInfo, Rates } from "@/utils/types";
import { deleteCookieAction } from "@/utils/actions";

export default function CashOut({
  nullaInfo,
  paymentSettings,
  cashoutSettings,
  setErrorModal,
  setTradeMAXModal,
  rates,
  isCbLinked,
}: {
  nullaInfo: NullaInfo;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  setErrorModal: any;
  setTradeMAXModal: any;
  rates: Rates;
  isCbLinked: boolean;
}) {
  console.log("/app, Cashout.tsx");

  // hooks
  const router = useRouter();
  const t = useTranslations("App.CashOut");
  const tcommon = useTranslations("Common");
  const { data: nullaBalance, isError: nullaBalanceIsError } = useNullaBalanceQuery();
  const { data: cbBalance, isError: cbBalanceIsError } = useCbBalanceQuery(isCbLinked);
  const { data: cbTxns, isError: cbTxnsIsError } = useCbTxnsQuery(isCbLinked);

  // states
  const [cbOptionsModal, setCbOptionsModal] = useState(false);
  const [nullaOptionsModal, setNullaOptionsModal] = useState(false);
  const [nullaDetails, setNullaDetails] = useState(false);
  const [cexDetails, setCexDetails] = useState(false);
  const [transferModal, setTransferModal] = useState<"toCex" | "toBank" | "toAny" | null>(null);
  const [cashoutIntroModal, setCashoutIntroModal] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("cashoutIntroModal")) setCashoutIntroModal(true); // show cashoutIntroModal or not
  }, []);

  // handle react query error
  useEffect(() => {
    if (cbBalanceIsError || cbTxnsIsError) {
      console.log("cbBalanceIsError or cbTxnsIsError");
      unlinkCb();
    }
  }, [cbBalanceIsError, cbTxnsIsError]);

  const linkCb = async () => {
    const cbRandomSecure = uuidv4() + "SUBSTATEcashOut";
    window.sessionStorage.setItem("cbRandomSecure", cbRandomSecure);
    const redirectUrlEncoded = encodeURI(`${process.env.NEXT_PUBLIC_DEPLOYED_BASE_URL}/cbAuth`);
    const scope =
      "wallet:accounts:read,wallet:addresses:read,wallet:sells:create,wallet:withdrawals:create,wallet:payment-methods:read,wallet:user:read,wallet:withdrawals:read,wallet:trades:read,wallet:transactions:read,wallet:buys:create";
    router.push(
      `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID}&redirect_uri=${redirectUrlEncoded}&state=${cbRandomSecure}&scope=${scope}`
    );
  };

  //TODO: usecallback
  function unlinkCb() {
    deleteCookieAction("cbAccessToken");
    deleteCookieAction("cbRefreshToken");
    setTransferModal(null);
  }

  const onClickTransferToCex = async () => {
    if (cashoutSettings.cex === "Coinbase") {
      isCbLinked ? setTransferModal("toCex") : setErrorModal(t("errors.linkCb"));
    } else {
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
    }
  };

  const onClickOutsideCexOptions = () => {
    setCbOptionsModal(false);
    document.removeEventListener("click", onClickOutsideCexOptions);
  };

  const onClickOutsideNullaOptions = () => {
    setNullaOptionsModal(false);
    document.removeEventListener("click", onClickOutsideNullaOptions);
  };

  return (
    <section className="appPageContainer bg-light2 dark:bg-dark1 py-[24px] portrait:sm:py-[32px] landscape:lg:py-[32px] overflow-y-auto">
      {/*---NULLA PAY CARD ---*/}
      <div className="cashoutCard">
        {/*--- title + more options ---*/}
        <div className="w-full h-[36px] flex justify-between items-center relative">
          {/*--- title ---*/}
          <div className="cashoutHeader">Nulla Pay {tcommon("account")}</div>
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
              {isCbLinked && cbBalance && rates && (
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
              <CashoutBalance paymentSettings={paymentSettings} rates={rates} balance={cbBalance} details={cexDetails} setDetails={setCexDetails} />
            ) : (
              <div className="flex-1 w-full flex justify-center items-center">
                <span className="link" onClick={linkCb}>
                  {t("linkCoinbase")}
                </span>
              </div>
            )}
            {/*--- button ---*/}
            {isCbLinked && cbBalance && rates && (
              <button className="cashoutButton" onClick={() => setTransferModal("toBank")}>
                {tcommon("transferToBank")}
              </button>
            )}
          </div>
          {/*--- pending transactions ---*/}
          {isCbLinked && cbTxns && (cbTxns.pendingUsdWithdrawals.length > 0 || cbTxns.pendingUsdcDeposits.length > 0 || cbTxns.pendingUsdcWithdrawals.length > 0) && (
            <div className="pendingCard">
              {cbTxns.pendingUsdcDeposits.map((txn: any, index: number) => (
                <div key={index} className="w-full flex justify-between">
                  <p>Pending USDC deposit</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
              {cbTxns.pendingUsdcWithdrawals.map((txn: any, index: number) => (
                <div key={index} className="w-full flex justify-between">
                  <p>Pending USDC withdrawal</p>
                  <p>{txn.amount.amount}</p>
                </div>
              ))}
              {cbTxns.pendingUsdWithdrawals.map((txn: any, index: number) => (
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
          unlinkCb={unlinkCb}
          isCbLinked={isCbLinked}
        />
      )}
      {cashoutIntroModal && paymentSettings && cashoutSettings && (
        <CashoutIntroModal paymentSettings={paymentSettings} cashoutSettings={cashoutSettings} setCashoutIntroModal={setCashoutIntroModal} setTradeMAXModal={setTradeMAXModal} />
      )}
    </section>
  );
}
