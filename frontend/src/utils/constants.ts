import { RateKey, AllRates } from "@/utils/types";
import { CashoutSettings, PaymentSettings } from "@/db/UserModel";
import { IconType } from "react-icons";
import { FaCircleUser, FaBed, FaCar, FaMapLocationDot, FaTicket, FaHandHoldingDollar, FaUserTag, FaCartArrowDown, FaCartShopping } from "react-icons/fa6";

export const currencyToKeys: Record<string, { usdToLocal: RateKey; usdcToLocal: RateKey }> = {
  EUR: { usdToLocal: "usdToEur", usdcToLocal: "usdcToEur" },
  GBP: { usdToLocal: "usdToGbp", usdcToLocal: "usdcToGbp" },
  TWD: { usdToLocal: "usdToTwd", usdcToLocal: "usdcToTwd" },
};

export const defaultRates: AllRates = {
  EUR: { usdToLocal: 0.9469, usdcToLocal: 0.9534 },
  GBP: { usdToLocal: 0.7961, usdcToLocal: 0.8002 },
  TWD: { usdToLocal: 32.28, usdcToLocal: 33.15 },
  USD: { usdToLocal: 1, usdcToLocal: 1 },
};

// langs
type LangObject = { id: "en" | "fr" | "it" | "zh-TW"; text: string };
export const langObjectArray: LangObject[] = [
  { id: "en", text: "English" },
  { id: "fr", text: "Français" },
  { id: "it", text: "Italiana" },
  { id: "zh-TW", text: "中文" },
];

type CexToName = { [key: string]: { [key: string]: string } };
export const cexToName: CexToName = {
  en: { Coinbase: "Coinbase", MAX: "MAX Exchange" },
  fr: { Coinbase: "Coinbase", MAX: "MAX Exchange" },
  it: { Coinbase: "Coinbase", MAX: "MAX Exchange" },
  "zh-TW": { Coinbase: "Coinbase", MAX: "MAX 交易所" },
};

export const fieldsList = ["email", "item", "date", "daterange", "count", "sku", "shipping", "time"]; // delete??

export const cexLinks: any = {
  Coinbase: {
    desktop: "https://www.coinbase.com/signup",
    apple: "https://apps.apple.com/us/app/coinbase-buy-bitcoin-ether/id886427730",
    google: "https://play.google.com/store/apps/details?id=com.coinbase.android",
    huawei: "",
  },
  MAX: {
    desktop: "https://max.maicoin.com/signup",
    apple: "https://apps.apple.com/tw/app/max-%E8%99%9B%E6%93%AC%E8%B2%A8%E5%B9%A3%E4%BA%A4%E6%98%93%E6%89%80/id1370837255",
    google: "https://play.google.com/store/apps/details?id=com.maicoin.max",
    huawei: "",
  },
  "Coins.ph": {
    desktop: "",
    apple: "https://apps.apple.com/ph/app/coins-buy-bitcoin-crypto/id972324049",
    google: "https://play.google.com/store/apps/details?id=asia.coins.mobile",
    huawei: "https://appgallery.huawei.com/app/C100996255",
  },
};

// United States, Euro countries,
export const countryData: { [key: string]: { the?: boolean; currency: string; CEXes: string[]; networks?: string[]; tokens?: string[]; bank?: string } } = {
  Taiwan: {
    currency: "TWD",
    CEXes: ["MAX", "BitoPro", "Other"],
    networks: ["Polygon", "BNB"], // in order of popularity
    tokens: ["USDT", "USDC"], // in order of popularity
    bank: "Bank of Taiwan",
  },
  Philippines: {
    the: true,
    currency: "PHP",
    CEXes: ["Coins.ph", "PDAX", "Other"],
    networks: ["Polygon", "BNB", "Arbitrum"], // in order of popularity
    tokens: ["USDT", "USDC"], // in order of popularity
    bank: "PNB Philippines",
  },
  "U.S.": {
    the: true,
    currency: "USD",
    CEXes: ["Coinbase", "Other"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC"], // in order of popularity
    bank: "Wise",
  },
  "U.K.": {
    the: true,
    currency: "GBP",
    CEXes: ["Coinbase", "Other"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  "Euro countries": {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  Austria: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Belgium: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Croatia: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Cyprus: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Estonia: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Finland: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  France: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Germany: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Greece: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Ireland: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Italy: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Latvia: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Lithuania: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Luxembourg: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Malta: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Monaco: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Montenegro: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Netherlands: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Portugal: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  "San Marino": {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Slovakia: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Slovenia: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Spain: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },
  Vatican: {
    currency: "EUR",
    CEXes: ["Coinbase", "Other"],
  },

  Canada: {
    currency: "CAD",
    CEXes: ["Coinbase", "Other"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  Australia: {
    currency: "AUD",
    CEXes: ["Coinbase", "Other"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },

  Japan: {
    currency: "JPY",
    CEXes: ["UniSwap", "BitFlyer"],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "SMBC Trust Bank",
  },
  Korea: {
    currency: "KRW",
    CEXes: ["Upbit (via BTC)", "Bithumb", "Korbit", "GoPAX"],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Woori Bank",
  },
  "Hong Kong": {
    currency: "HKD",
    CEXes: [],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Hang Seng Bank",
  },
  Singapore: {
    currency: "SGD",
    CEXes: [],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "OCBC Bank",
  },
  Thailand: {
    currency: "THB",
    CEXes: [],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Bangkok Bank",
  },
  Indonesia: {
    currency: "IDR",
    CEXes: [],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Bank Rakyat Indonesia",
  },
  Malaysia: {
    currency: "MYR",
    CEXes: [],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Maybank",
  },
  Vietnam: {
    currency: "VND",
    CEXes: [],
    networks: [""], // in order of popularity
    tokens: [""], // in order of popularity
    bank: "Vietcombank",
  },
};

export const incomplete = {
  "CEX.IO Exchange": {
    networkTokens: ["BNB-USDT"],
    withdrawalFee: { SEPA: { amount: 3, currency: "EUR" }, FPS: { amount: 3, currency: "GBP" } },
    tradingFee: 0.0025,
  },
  "Bitstamp Exchange": {
    networkTokens: [],
    withdrawalFee: {
      ACH: { amount: 0, currency: "USD" },
      SEPA: { amount: 3, currency: "EUR" },
      FPS: { amount: 2, currency: "GBP" },
    },
    tradingFee: 0.0008,
  },
  "Rybit Exchange": { networkToken: ["BNB-USDT"], withdrawalFee: 15, tradingFee: 0 },
  "Ace Exchange": { networkToken: ["BNB-USDT", "BNB-USDC"], withdrawalFee: 15, tradingFee: 0 },
  "Binance (P2P Marketplace)": {
    networkTokens: ["Polygon-USDC", "Polygon-USDT", "BNB-USDC", "BNB-USDT", "Optimism-USDC", "Optimism-USDT", "Arbitrum-USDC", "Arbitrum-USDT", "Avalanche-USDC", "Avalanche-USDT"],
    withdrawalFee: 0,
    tradingFee: 0,
  },
};

export type CEX = {
  networkTokens: string[];
  networks: string[];
  tokens: string[];
  tradingFee: number;
  withdrawalFee: any;
  USDC?: string[];
  USDT?: string[];
  EURC?: string[];
  EURT?: string[];
};

type MerchantType2data = {
  [key: string]: {
    text: string;
    subtext?: string;
    merchantFields: string[];
    merchantName: string;
    itemlabel: string;
    fa: IconType;
    tooltip?: string;
  };
};
export const merchantType2data: MerchantType2data = {
  onlinephysical: {
    text: "Online Stores",
    subtext: "physical items",
    merchantFields: ["email", "item", "shipping"],
    merchantName: "An Online Store in",
    itemlabel: "Item Name",
    fa: FaCartShopping,
    tooltip: "Copy and paste the item name(s) from the business's official website. Generally, include enough information so the business knows what you are purchasing.",
  },
  onlinedigital: {
    text: "Online Stores",
    subtext: "digital items",
    merchantFields: ["email", "item"],
    merchantName: "An Online Store in",
    itemlabel: "Item Name",
    fa: FaCartArrowDown,
    tooltip: "Copy and paste the item name(s) from the business's official website. Generally, include enough information so the business knows what you are purchasing.",
  },
  creators: { text: "Creators", merchantFields: ["email", "item"], merchantName: "InfluencerX in", itemlabel: "Item Name", fa: FaCircleUser },
  hotels: {
    text: "Hotels",
    merchantFields: ["email", "item", "count", "daterange"],
    merchantName: "A Hotel in",
    itemlabel: "Room Name",
    fa: FaBed,
    tooltip: "Enter the name of the room type found on the hotel's official website. Include any special requests.",
  },
  taxis: {
    text: "Taxis",
    merchantFields: ["email", "item", "date", "time", "count"],
    merchantName: "A Taxi Service in",
    itemlabel: "Trip Details",
    fa: FaCar,
    tooltip: "Enter a description of where to be picked up and where to be dropped off",
  },
  tours: {
    text: "Tour Packages",
    merchantFields: ["email", "item", "daterange", "count"],
    merchantName: "AmazingTours in",
    itemlabel: "Tour Name",
    fa: FaMapLocationDot,
    tooltip: "Enter the name of the tour package from the business's official website",
  },
  gigs: {
    text: "Gig Workers",
    merchantFields: ["email", "item"],
    merchantName: "Jane Smith in",
    itemlabel: "Item Name",
    fa: FaUserTag,
    tooltip: "Enter what you are paying the person for",
  },
  tickets: {
    text: "Tickets",
    merchantFields: ["email", "item"],
    merchantName: "A Concert in",
    itemlabel: "Ticket Name",
    fa: FaTicket,
    tooltip: "Enter the name of the ticket from the official website",
  },
  donations: {
    text: "Donations",
    merchantFields: ["email", "item"],
    merchantName: "Tom's Medical Treatment in",
    itemlabel: "Message",
    fa: FaHandHoldingDollar,
  },
};

export const currency2symbol: any = { USD: "$", EUR: "€", TWD: "TWD " };
export const currency2decimal: any = { USD: 2, EUR: 2, TWD: 0 };
export const currency2rateDecimal: any = { USD: 4, EUR: 4, TWD: 3 };
export const currency2number: any = { USD: 5, EUR: 5, TWD: 100, PHP: 100 };
export const currency2correction: any = { USD: 0.997, EUR: 0.997, TWD: 0.994 }; // CEX fees + 0.003
export const currency2bank: any = { EUR: "Wise", TWD: "Bank of Taiwan" };
export const currency2cex: any = { EUR: "Coinbase", USD: "Coinbase", TWD: "MAX" };
export const cexToLinks: any = {
  MAX: {
    website: "https://max.maicoin.com/",
    appleStore: "https://apps.apple.com/tw/app/max-%E8%99%9B%E6%93%AC%E8%B2%A8%E5%B9%A3%E4%BA%A4%E6%98%93%E6%89%80/id1370837255",
    googlePlay: "https://play.google.com/store/apps/details?id=com.maicoin.max&pcampaignid=web_share",
  },
  Coinbase: {
    website: "https://www.coinbase.com/",
    appleStore: "https://apps.apple.com/us/app/coinbase-buy-bitcoin-ether/id886427730",
    googlePlay: "https://play.google.com/store/apps/details?id=com.coinbase.android",
  },
  "Coins.ph": {
    website: "https://coins.ph/",
    appleStore: "https://apps.apple.com/ph/app/coins-buy-bitcoin-crypto/id972324049",
    googlePlay: "https://play.google.com/store/apps/details?id=asia.coins.mobile",
  },
};
export const currencyToExample: any = {
  USD: { rate: "1", localSent: "10", usdcReceived: "9.80", localReceived: "9.80", localReceivedIntended: "9.80" },
  EUR: { rate: "0.90", localSent: "10", usdcReceived: "10.9217", localReceived: "9.83", localReceivedIntended: "9.80" },
  TWD: { rate: "32", localSent: "1000", usdcReceived: "30.7172", localReceived: "983", localReceivedIntended: "980" },
};

export const list2string = (list: string[]) => {
  let text;
  if (list.length === 1) {
    text = list[0];
  } else if (list.length === 2) {
    let newlist = list.toSpliced(1, 0, "and");
    text = newlist.join(" ");
  } else {
    let newlist = list.slice(0, list.length - 1);
    text = newlist.join(", ") + ", and " + list[list.length - 1];
  }
  return text;
};

// add Andorra
export const countryCurrencyList = [
  "Austria / EUR", // 1
  "Belgium / EUR", // 2
  "Croatia / EUR", // 3
  "Cyprus / EUR", // 4
  "Estonia / EUR", // 5
  "Finland / EUR", // 6
  "France / EUR", // 7
  "Germany / EUR", // 8
  "Greece / EUR", // 9
  "Ireland / EUR", // 10
  "Italy / EUR", // 11
  "Latvia / EUR", // 12
  "Lithuania / EUR", // 13
  "Luxembourg / EUR", // 14
  "Malta / EUR", // 15
  "Monaco / EUR",
  "Montenegro / EUR",
  "Netherlands / EUR", // 16
  "Philippines / PHP",
  "Portugal / EUR", // 17
  "San Marino / EUR",
  "Slovakia / EUR", // 18
  "Slovenia / EUR", // 19
  "Spain / EUR", // 20
  "Taiwan / TWD",
  "U.S. / USD",
  "U.K. / GBP",
  "Vatican / EUR",
  "Other / USD",
  "Other / EUR",
];

export const currencyList = ["USD", "EUR", "TWD"];

type currencyToDataValue = {
  cex: string;
  symbol: string;
  offrampNetwork: string;
  offrampFee: string;
  conversionFee: string;
};
export const currencyToData: { [key: string]: currencyToDataValue } = {
  USD: { cex: "Coinbase", symbol: "$", offrampNetwork: "ACH", offrampFee: "$0", conversionFee: "0.001%" },
  EUR: { cex: "Coinbase", symbol: "€", offrampNetwork: "SEPA", offrampFee: "€0", conversionFee: "0.001%" },
  TWD: { cex: "MAX", symbol: "NT", offrampNetwork: "CIFS", offrampFee: "NT15", conversionFee: "0.3%" },
};

export const abb2full: { [key: string]: string } = {
  AT: "Austria", // 1
  BE: "Belgium", // 2
  HR: "Croatia", // 3
  CY: "Cyprus", // 4
  EE: "Estonia", // 5
  FI: "Finland", // 6
  FR: "France", // 7
  DE: "Germany", // 8
  GR: "Greece", // 9
  IE: "Ireland", // 10
  IT: "Italy", // 11
  LV: "Latvia", // 12
  LT: "Lithuania", // 13
  LU: "Luxembourg", // 14
  MT: "Malta", // 15
  MC: "Monaco",
  ME: "Montenegro",
  NL: "Netherlands", // 16
  PH: "Philippines",
  PT: "Portugal", // 17
  SM: "San Marino",
  SK: "Slovakia", // 18
  SI: "Slovenia", // 19
  ES: "Spain", // 20
  TW: "Taiwan",
  US: "U.S.",
  GB: "U.K.",
  VA: "Vatican",
};

export const fees: any = { "Coinbase Exchange": { "United States": "no", "Euro countries": "no" }, "MAX Exchange": { Taiwan: "15 TWD" } };

export const CEXdata: { [key: string]: CEX } = {
  "Coinbase Exchange": {
    networkTokens: ["Polygon-USDC", "Polygon-USDT", "Base-USDC", "Optimism-USDC", "Optimism-USDT", "Arbitrum-USDC", "Arbitrum-USDT", "Avalanche-USDC", "Avalanche-USDT"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"],
    tokens: ["USDC", "USDT"],
    tradingFee: 0,
    withdrawalFee: { ACH: 0, SEPA: 0 },
    USDC: ["USD", "EUR", "GBP"],
    USDT: ["USD", "EUR", "GBP"],
    EURC: ["USD", "EUR"],
  },
  Coinbase: {
    networkTokens: ["Polygon-USDC", "Base-USDC", "Optimism-USDC", "Arbitrum-USDC", "Avalanche-USDC"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"],
    tokens: ["USDC"],
    tradingFee: 0,
    withdrawalFee: { ACH: 0, SEPA: 0 },
    USDC: ["USD", "EUR", "GBP"],
    USDT: ["USD", "EUR", "GBP"],
    EURC: ["USD", "EUR"],
  },
  "Kraken Exchange": {
    networkTokens: ["Polygon-USDC", "Polygon-USDT", "Arbitrum-USDC", "Arbitrum-USDT"],
    networks: ["Polygon", "Arbitrum"],
    tokens: ["USDC", "USDT"],
    withdrawalFee: {
      ACH: { amount: 0, currency: "USD" },
      SEPA: { amount: 1, currency: "EUR" },
      FPS: { amount: 1.95, currency: "GBP" },
      EFT: { percentage: 0.0035, currency: "CAD" },
      "bank transfer": { amount: 0, currency: "AUD" },
      Osko: { amount: 0, currency: "AUD" },
    },
    tradingFee: 0.002,
    USDC: ["USD", "EUR", "GBP", "AUD", "CHF", "CAD"],
    USDT: ["USD", "EUR", "GBP", "AUD", "CHF", "CAD"],
    EURT: ["USD", "EUR"],
  },
  "MAX Exchange": {
    networkTokens: ["Polygon-USDC", "Polygon-USDT", "BNB-USDC", "BNB-USDT"],
    networks: ["Polygon", "BNB"],
    tokens: ["USDC", "USDT"],
    withdrawalFee: 15,
    tradingFee: 0.003,
  },
  "BitoPro Exchange": {
    networkTokens: ["Polygon-USDC", "Polygon-USDT"],
    networks: ["Polygon", "BNB"],
    tokens: ["USDC", "USDT"],
    withdrawalFee: 15,
    tradingFee: 0.002,
  },
};

export const paymentSettings: PaymentSettings = {
  merchantEvmAddress: "",
  merchantEmail: "",
  merchantName: "",
  merchantCountry: "",
  merchantCurrency: "",
  merchantPaymentType: "",
  merchantGoogleId: "",
  qrCodeUrl: "",
  hasEmployeePass: false,
};

export const cashoutSettings: CashoutSettings = {
  cex: "Coinbase",
  cexEvmAddress: "",
};
