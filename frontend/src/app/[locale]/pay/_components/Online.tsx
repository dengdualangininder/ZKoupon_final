import React from "react";
// types
import { Rates } from "@/utils/types";

const Online = ({
  urlParams,
  currencyAmount,
  setCurrencyAmount,
  showNetwork,
  setShowNetwork,
  merchantNetworks,
  selectedNetwork,
  selectedToken,
  onClickNetwork,
  rates,
  isGettingBalance,
  USDCBalance,
  send,
  fxSavings,
  tokenAmount,
  setTokenAmount,
}: {
  urlParams: any;
  currencyAmount: string;
  setCurrencyAmount: any;
  showNetwork: boolean;
  setShowNetwork: any;
  merchantNetworks: any;
  selectedNetwork: string;
  selectedToken: string;
  onClickNetwork: any;
  rates: Rates;
  isGettingBalance: boolean;
  USDCBalance: string;
  send: any;
  fxSavings: string;
  tokenAmount: string;
  setTokenAmount: any;
}) => {
  return <div>Online</div>;
};

export default Online;
