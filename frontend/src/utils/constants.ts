import { faCircleUser, faBed, faCar, faMapLocationDot, faTicket, faHandHoldingDollar, faUserTag, faCartArrowDown, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
// import { config } from '@fortawesome/fontawesome-svg-core'
// config.autoAddCss = false

// import placard components
import PlacardCoinbaseCashback from "./components/PlacardCoinbaseCashback";
import PlacardCoinbaseUSDCCashback from "./components/PlacardCoinbaseUSDCCashback";
import PlacardKrakenCashback from "./components/PlacardKrakenCashback";
import PlacardMAXCashback from "./components/PlacardMAXCashback";
import PlacardBitoCashback from "./components/PlacardBitoCashback";

// import placard SVGs
import placardCoinbaseCashback from "/public/placardCoinbaseCashback.svg";
import placardCoinbaseUSDCCashback from "/public/placardCoinbaseUSDCCashback.svg";
import placardKrakenCashback from "/public/placardKrakenCashback.svg";
import placardMAXCashback from "/public/placardMAXCashback.svg";
import placardBitoCashback from "/public/placardBitoCashback.svg";

export const fieldsList = ["email", "item", "date", "daterange", "count", "sku", "shipping", "time"]; // delete??
export const activeCountries = ["Euro countries (EUR)", "United States (USD)", "Taiwan (TWD)"];

export const countryData: { [key: string]: { the?: boolean; currency: string; CEXes: string[]; networks: string[]; tokens: string[]; bank: string } } = {
  Taiwan: {
    currency: "TWD",
    CEXes: ["MAX Exchange", "BitoPro Exchange"],
    networks: ["Polygon", "BNB"], // in order of popularity
    tokens: ["USDT", "USDC"], // in order of popularity
    bank: "Bank of Taiwan",
  },
  "United States": {
    the: true,
    currency: "USD",
    CEXes: ["Coinbase Exchange", "Kraken Exchange"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC"], // in order of popularity
    bank: "Wise",
  },
  "Euro countries": {
    currency: "EUR",
    CEXes: ["Coinbase Exchange", "Kraken Exchange"],
    networks: ["Polygon", "Arbitrum"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  "United Kingdom": {
    the: true,
    currency: "GBP",
    CEXes: ["Coinbase Exchange", "Kraken Exchange"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  Canada: {
    currency: "CAD",
    CEXes: ["Coinbase Exchange", "Kraken Exchange"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  Australia: {
    currency: "AUD",
    CEXes: ["Coinbase Exchange", "Kraken Exchange"],
    networks: ["Polygon", "Optimism", "Base", "Arbitrum", "Avalanche"], // in order of popularity
    tokens: ["USDC", "USDT"], // in order of popularity
    bank: "Wise",
  },
  Philippines: {
    the: true,
    currency: "PHP",
    CEXes: ["Coins.ph", "PDAX Exchange"],
    networks: ["Polygon", "BNB", "Arbitrum"], // in order of popularity
    tokens: ["USDT", "USDC"], // in order of popularity
    bank: "PNB Philippines",
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
    CEXes: ["Upbit Exchange (via BTC)", "Bithumb Exchange", "Korbit Exchange", "GoPAX Exchange"],
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
  placard: {
    component: React.FunctionComponent;
    svg: SVGElement;
    fig: string;
  };
};
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

type MerchantType2data = {
  [key: string]: {
    text: string;
    subtext?: string;
    merchantFields: string[];
    merchantName: string;
    itemlabel: string;
    fa: IconDefinition;
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
    fa: faShoppingCart,
    tooltip: "Copy and paste the item name(s) from the business's official website. Generally, include enough information so the business knows what you are purchasing.",
  },
  onlinedigital: {
    text: "Online Stores",
    subtext: "digital items",
    merchantFields: ["email", "item"],
    merchantName: "An Online Store in",
    itemlabel: "Item Name",
    fa: faCartArrowDown,
    tooltip: "Copy and paste the item name(s) from the business's official website. Generally, include enough information so the business knows what you are purchasing.",
  },
  creators: { text: "Creators", merchantFields: ["email", "item"], merchantName: "InfluencerX in", itemlabel: "Item Name", fa: faCircleUser },
  hotels: {
    text: "Hotels",
    merchantFields: ["email", "item", "count", "daterange"],
    merchantName: "A Hotel in",
    itemlabel: "Room Name",
    fa: faBed,
    tooltip: "Enter the name of the room type found on the hotel's official website. Include any special requests.",
  },
  taxis: {
    text: "Taxis",
    merchantFields: ["email", "item", "date", "time", "count"],
    merchantName: "A Taxi Service in",
    itemlabel: "Trip Details",
    fa: faCar,
    tooltip: "Enter a description of where to be picked up and where to be dropped off",
  },
  tours: {
    text: "Tour Packages",
    merchantFields: ["email", "item", "daterange", "count"],
    merchantName: "AmazingTours in",
    itemlabel: "Tour Name",
    fa: faMapLocationDot,
    tooltip: "Enter the name of the tour package from the business's official website",
  },
  gigs: {
    text: "Gig Workers",
    merchantFields: ["email", "item"],
    merchantName: "Jane Smith in",
    itemlabel: "Item Name",
    fa: faUserTag,
    tooltip: "Enter what you are paying the person for",
  },
  tickets: {
    text: "Tickets",
    merchantFields: ["email", "item"],
    merchantName: "A Concert in",
    itemlabel: "Ticket Name",
    fa: faTicket,
    tooltip: "Enter the name of the ticket from the official website",
  },
  donations: {
    text: "Donations",
    merchantFields: ["email", "item"],
    merchantName: "Tom's Medical Treatment in",
    itemlabel: "Message",
    fa: faHandHoldingDollar,
  },
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

// export const getSafe = (object, errorReturn) => {
//   try {
//     return object;
//   } catch (e) {
//     return errorReturn;
//   }
// };

export const currencyList = [
  "Select",
  // "Brazil (BRL)",
  // "France (EUR)",
  // "Germany (EUR)",
  // "India (INR)",
  // "Palau (USD)",
  // "Serbia (RSD)",
  "Philippines (PHP)",
  "Taiwan (TWD)",
  // "Turkey (TRY)",
  // "United States (USD)",
  // "United Kingdom (GBP)",
];

export const currencyNames = [
  "Select a currency",
  // "AED (UAE Dirham)",
  // "ARS Argentine Peso",
  // "AUD (Australian Dollar)",
  // "BGN Bulgarian Lev",
  // "BHD (Bahraini Dinar)",
  // "BRL (Brazilian Real)",
  // "CAD (Canadian Dollar)",
  // "CHF (Swiss Franc)",
  // "CLP (Chilean Peso)",
  // "CNY (Renminbi)",
  // "COP (Colombian Peso)",
  // "CZK (Czech Koruna)",
  // "DKK (Danish Krone)",
  // "EUR (Euro)",
  // "GBP (British Pound)",
  // "HKD (Hong Kong Dollar)",
  // "HUF (Hungarian Forint)",
  // "IDR (Indonesian Rupiah)",
  // "ILS (Israeli New Shekel)",
  // "INR (Indian Rupee)",
  // "JPY (Japanese Yen)",
  // "KRW (Korean Won)",
  // "MXN (Mexican Peso)",
  // "MYR (Malaysian Ringgit)",
  // "NOK (Norwegian Krone)",
  // "NZD (New Zealand Dollar)",
  // "PEN (Peruvian Sol)",
  "PHP (Philippine Pesos)",
  // "PLN (Polish Zloty)",
  // "RON (Romanian Leu)",
  // "RUB (Russian Ruble)",
  // "SAR (Saudi Riyal)",
  // "SEK (Swedish Krona)",
  // "SGD (Singaporean Dollar)",
  // "THB (Thai Baht)",
  // "TRY (Turkish Lira)",
  "TWD (Taiwan Dollar)",
  "USD (US Dollar)",
  // "ZAR (South African Rand)",
];

const euroList = [
  "Austria",
  "Belgium",
  "Croatia",
  "Cyprus",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Portugal",
  "Slovakia",
  "Slovenia",
  "Spain",
];

export const countryList = [
  "Select country",
  // UAE,
  // Argentina,
  "Australia",
  // Bulgaria,
  // Bahrain,
  // Brazil,
  // Canada,
  // Switzerland,
  // Chile,
  // China,
  // Colombia,
  // "Czech Republic",
  // Denmark,
  "United Kingdom",
  "Hong Kong",
  // Hungary,
  // Indonesia,
  // Israel,
  // India,
  "Japan",
  "Korea",
  // Mexico,
  // Malaysia,
  // "New Zealand",
  // Peru,
  "Philippines",
  // Poland,
  // Romania,
  // Russia,
  // "Saudi Arabia",
  // Sweden,
  // Singapore,
  // Thailand,
  "Turkey",
  "Taiwan",
  "USA",
];

export const euroCountries: any = {
  AD: "Andorra",
  AT: "Austria",
  BE: "Belgium",
  CY: "Cyprus",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GR: "Greece",
  IE: "Ireland",
  IT: "Italy",
  XK: "Kosovo",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxemburg",
  MT: "Malta",
  MC: "Monaco",
  ME: "Montenegro",
  NL: "Netherlands",
  PT: "Portugal",
  SM: "San Marino",
  SK: "Slovakia",
  SI: "Slovenia",
  ES: "Spain",
  VA: "Vatican City",
};

export const abb2full: any = {
  US: "United States",
  TW: "Taiwan",
  AD: "Euro countries",
  AT: "Euro countries",
  BE: "Euro countries",
  CY: "Euro countries",
  EE: "Euro countries",
  FI: "Euro countries",
  FR: "Euro countries",
  DE: "Euro countries",
  GR: "Euro countries",
  IE: "Euro countries",
  IT: "Euro countries",
  XK: "Euro countries",
  LV: "Euro countries",
  LT: "Euro countries",
  LU: "Euro countries",
  MT: "Euro countries",
  MC: "Euro countries",
  ME: "Euro countries",
  NL: "Euro countries",
  PT: "Euro countries",
  SM: "Euro countries",
  SK: "Euro countries",
  SI: "Euro countries",
  ES: "Euro countries",
  VA: "Euro countries",
};

export const fees: any = { "Coinbase Exchange": { "United States": "no", "Euro countries": "no" }, "MAX Exchange": { Taiwan: "15 TWD" } };
