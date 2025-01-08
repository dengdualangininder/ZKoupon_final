"server only";

export async function getUsdcToLocal(merchantCurrency: string) {
  const sheetOrder = ["EUR", "GBP", "TWD"];
  const sheetIndex = sheetOrder.findIndex((i) => i === merchantCurrency);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1VnZjhKY6QCNYrc9lcSHd3BO1Ws_sXc0jyPNvlwbJhkE/values/coinbase!J4:L4?key=${process.env.GOOGLE_API_KEY}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return Number(data.values[0][sheetIndex]);
}

export async function getUsdToLocal(merchantCurrency: string) {
  const sheetOrder = ["EUR", "GBP", "TWD"];
  const sheetIndex = sheetOrder.findIndex((i) => i === merchantCurrency);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1AYtFng--zDWlSJmQuF16dyXwdxvrsM6SItTTYSpVq0s/values/Sheet1!B2:G2?key=${process.env.GOOGLE_API_KEY}`, {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  return Number(data.values[0][sheetIndex * 2]);
}
