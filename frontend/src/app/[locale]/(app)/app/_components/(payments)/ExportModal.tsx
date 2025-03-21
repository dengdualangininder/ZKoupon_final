import { useState, useEffect } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Transaction } from "@/db/UserModel";
import { useW3Info } from "../../../Web3AuthProvider";
import { ModalState } from "@/utils/types";

export default function ExportModal({ exportModal, setExportModal, setErrorModal }: { exportModal: ModalState; setExportModal: any; setErrorModal: any }) {
  // hooks
  const t = useTranslations("App.Payments");
  const w3Info = useW3Info();

  // states
  const [startMonthYear, setStartMonthYear] = useState("");
  const [endMonthYear, setEndMonthYear] = useState("");
  const [downloadDates, setDownloadDates] = useState<string[]>([]);

  // create selectable dates
  useEffect(() => {
    const getPaymentsRange = async () => {
      try {
        const res = await fetch("/api/getPaymentsRange", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ w3Info }),
        });
        const resJson = await res.json();
        if (resJson.status === "success") {
          await createDates({ firstTxn: resJson.data.firstTxn, lastTxn: resJson.data.lastTxn });
          return;
        }
      } catch (e) {}
      setErrorModal("Error: Could not access payments range");
    };
    getPaymentsRange();
  }, []);

  async function createDates({ firstTxn, lastTxn }: { firstTxn: Transaction; lastTxn: Transaction }) {
    let firstyear = Number(firstTxn.date.split("-")[0]);
    let firstmonth = Number(firstTxn.date.split("-")[1]);
    let lastyear = Number(lastTxn.date.split("-")[0]);
    let lastmonth = Number(lastTxn.date.split("-")[1]);
    let years = Array.from({ length: lastyear - firstyear + 1 }, (value, index) => firstyear + index);
    let yearmonthArray = [];
    for (let year of years) {
      if (year === firstyear && year === lastyear) {
        for (let i = firstmonth; i < lastmonth + 1; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      } else if (year === firstyear && firstyear != lastyear) {
        for (let i = firstmonth; i < 13; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      } else if (year === lastyear && firstyear != lastyear) {
        for (let i = 1; i < lastmonth + 1; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      } else {
        for (let i = 1; i < 13; i++) {
          yearmonthArray.push(`${i}/${year}`);
        }
      }
    }
    setDownloadDates(yearmonthArray);
    setStartMonthYear(yearmonthArray.slice(-1)[0]);
    setEndMonthYear(yearmonthArray.slice(-1)[0]);
  }

  const exportTxns = async () => {
    const startDate = new Date(Number(startMonthYear.split("/")[1]), Number(startMonthYear.split("/")[0]) - 1, 1); // returns 1st, 0:00h
    const endDate = new Date(Number(endMonthYear.split("/")[1]), Number(endMonthYear.split("/")[0]), 1); // returns return 1st, 0:00h of the following month
    console.log("startDate:", startDate, "endDate:", endDate);

    try {
      const res = await fetch("/api/getPaymentsForExport", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ w3Info, startDate, endDate }),
      });
      var resJson = await res.json();
    } catch (e) {}
    if (resJson?.status != "success") {
      setErrorModal("Error when downloading payments");
      return;
    }
    const paymentsForExport = resJson.data;

    type Field = {
      csvHeader: string;
      txnKey: keyof Transaction;
    };
    const fields: Field[] = [
      { csvHeader: "Date", txnKey: "date" },
      { csvHeader: "Payment Amount", txnKey: "currencyAmount" },
      { csvHeader: "Merchant Currency", txnKey: "merchantCurrency" },
      { csvHeader: "Token Amount", txnKey: "tokenAmount" },
      { csvHeader: "Token", txnKey: "token" },
      { csvHeader: "Rate", txnKey: "blockRate" },
      { csvHeader: "Network", txnKey: "network" },
      { csvHeader: "Refunded?", txnKey: "refund" },
      { csvHeader: "Customer's Address", txnKey: "customerAddress" },
      { csvHeader: "Transaction Hash", txnKey: "txnHash" },
    ];

    const jsonToCsv = (paymentsForExport: Transaction[]) => {
      let csv = fields.map((i) => i.csvHeader).join(",") + "\n";
      paymentsForExport.forEach((txn: Transaction) => {
        let data = fields.map((field) => JSON.stringify(txn[field.txnKey])).join(",");
        csv = csv + data + "\n";
      });
      return csv;
    };

    const csv = jsonToCsv(paymentsForExport);
    const blob = new Blob([csv], { type: "text/csv" });
    const element = document.createElement("a");
    element.download = "payments.csv";
    element.href = window.URL.createObjectURL(blob);
    element.click();
  };

  function closeModal() {
    setExportModal({ render: true, show: false });
    setTimeout(() => setExportModal({ render: false, show: false }), 500);
    setStartMonthYear("");
    setEndMonthYear("");
  }

  return (
    <>
      <div className={`fixed inset-0 z-10`} onClick={() => closeModal()}></div>
      <div id="exportModal" className={`${exportModal.show ? "animate-slideIn" : "animate-slideOut"} sidebarModal`}>
        {/*--- HEADER ---*/}
        <div className="modalHeader">{t("downloadModal.title")}</div>
        {/*--- mobile back ---*/}
        <FaAngleLeft className="mobileBack" onClick={() => closeModal()} />
        {/*--- tablet/desktop close ---*/}
        <div className="xButtonContainer rounded-tr-none" onClick={() => closeModal()}>
          <div className="xButton">&#10005;</div>
        </div>
        {/*--- content ---*/}
        <div className="sidebarModalContentContainer">
          {/*---start month---*/}
          <div className="w-full flex items-center justify-between">
            <div className="font-medium">{t("downloadModal.start")}</div>
            <select
              className={`${
                downloadDates.length === 0 ? "italic text-slate-400 dark:text-zinc-700" : ""
              } textBaseAppPx w-[140px] desktop:w-[120px] inputColor px-[12px] appInputHeight`}
              value={startMonthYear}
              onChange={(e) => {
                setStartMonthYear(e.target.value);
                const [startMonth, startYear] = e.target.value.split("/");
                const [endMonth, endYear] = endMonthYear.split("/");
                if (endMonthYear && new Date(Number(startYear), Number(startMonth) - 1) > new Date(Number(endYear), Number(endMonth) - 1)) setEndMonthYear(e.target.value);
              }}
            >
              {downloadDates.length === 0 && <option>Loading...</option>}
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
          {/*---end month---*/}
          <div className="mt-[32px] w-full flex items-center justify-between">
            <div className="font-medium">{t("downloadModal.end")}</div>
            <select
              className={`${
                downloadDates.length === 0 ? "italic text-slate-400 dark:text-zinc-700" : ""
              } textBaseAppPx w-[140px] desktop:w-[120px] inputColor px-[12px] appInputHeight`}
              value={endMonthYear}
              onChange={(e) => {
                setEndMonthYear(e.target.value);
                const [startMonth, startYear] = startMonthYear.split("/");
                const [endMonth, endYear] = e.target.value.split("/");
                if (startMonth && new Date(Number(startYear), Number(startMonth) - 1) > new Date(Number(endYear), Number(endMonth) - 1)) setStartMonthYear(e.target.value);
              }}
            >
              {downloadDates.length === 0 && <option>Loading...</option>}
              {downloadDates.map((i) => (
                <option>{i}</option>
              ))}
            </select>
          </div>
          {/*--- button ---*/}
          <button className="mt-[50px] appButton1 w-full" onClick={exportTxns}>
            {t("downloadModal.download")}
          </button>
        </div>
      </div>
    </>
  );
}
