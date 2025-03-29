import { FallbackProvider, JsonRpcProvider } from "ethers";
import type { Chain, Client, Transport } from "viem";
import { currency2decimal } from "./constants";

export async function fetchPost(url: string, obj: { [key: string]: any }) {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) throw new Error();
  const resJson = await res.json();
  return resJson;
}

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback") {
    const providers = (transport.transports as ReturnType<Transport>[]).map(({ value }) => new JsonRpcProvider(value?.url, network));
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

export const getLocalTime = (mongoDate: string | undefined) => {
  if (!mongoDate) {
    return;
  }
  const time = new Date(mongoDate).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" });
  const timeObject = { time: time.split(" ")[0], ampm: time.split(" ")[1] };
  return timeObject;
};

// return format: April 2
export const getLocalDateWords = (mongoDate: string | undefined) => {
  if (!mongoDate) return;
  let date = new Date(mongoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }).split(",");
  return date[0];
};

// return format: 2024-04-02
export const getLocalDate = (mongoDate: string) => {
  let date = new Date(mongoDate).toLocaleString("en-GB").split(", ")[0].split("/");
  return `${date[2]}-${date[1]}-${date[0]}`;
};

export const formatCurrency = (currency: string, amount: string) => {
  const decimals = currency2decimal[currency];
  return (Math.floor(Number(amount) * Math.pow(10, decimals)) / Math.pow(10, decimals)).toString();
};

export const formatUsd = (amount: string) => {
  return (Math.floor(Number(amount) * 100) / 100).toString();
};
