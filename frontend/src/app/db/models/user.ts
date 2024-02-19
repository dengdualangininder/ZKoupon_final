import mongoose from "mongoose";

export type BalanceDetail = {
  date: Date;
  tokenAmount: number;
  token: string;
  network: string;
  userAddress: string;
  lingpayAddress: string;
  txnHash: string;
};

export type Transaction = {
  date: Date;
  customerAddress: string;
  currencyAmount: number;
  merchantCurrency: string;
  tokenAmount: number;
  token: string;
  network: string;
  blockRate: number;
  cashRate: number;
  savings: string;
  merchantAddress: string;
  refund: boolean;
  archive: boolean;
  // online params
  customerEmail: string;
  item: string;
  startDate: string;
  endDate: string;
  singleDate: string;
  time: string;
  countString: string;
  shipping: any;
  sku: string;
  // txnHash
  txnHash: string;
};

export interface Users extends mongoose.Document {
  dateCreated: Date;
  merchantEmail: string;
  password: string;
  employeePass: string;
  balance: { balance: number; history: BalanceDetail[] };
  paymentSettings: {
    merchantName: string;
    merchantCountry: string;
    merchantCurrency: string;
    merchantAddress: string;
    merchantNetworks: string[];
    merchantTokens: string[];
    paymentType: string;
    merchantWebsite: string;
    merchantType: string;
    merchantFields: string[]; // dates, count, sku, shipping, custom, <custom>,
    stablecoinmap: string;
    url: string;
  };
  cashoutSettings: {
    CEX: string;
    CEXAddress: string; // assumes all tokens have same EVM deposit address (need to double check this)
    CEXKey: string;
    CEXSecret: string;
  };
  transactions: Transaction[];
  intro: boolean;
}

const UserSchema = new mongoose.Schema<Users>({
  dateCreated: {
    type: Date,
    required: true,
  },
  merchantEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  employeePass: { type: String },
  balance: {
    balance: Number,
    history: [{ date: Date, tokenAmount: Number, token: String, network: String, userAddress: String, lingpayAddress: String, txnHash: String }],
  },
  paymentSettings: {
    merchantName: String,
    merchantCountry: String,
    merchantCurrency: String,
    merchantAddress: String,
    merchantNetworks: [String],
    merchantTokens: [String],
    paymentType: String,
    merchantWebsite: String,
    merchantType: String,
    merchantFields: [String], // dates, count, sku, shipping, custom, <custom>,
    stablecoinmap: String,
    url: String,
  },
  cashoutSettings: {
    CEX: String,
    CEXAddress: String, // assumes all tokens have same EVM deposit address (need to double check this)
    CEXKey: String,
    CEXSecret: String,
  },

  transactions: [
    {
      date: Date,
      customerAddress: String,
      currencyAmount: Number,
      merchantCurrency: String,
      tokenAmount: Number,
      token: String,
      network: String,
      blockRate: Number,
      cashRate: Number,
      savings: String,
      merchantAddress: String,
      refund: Boolean,
      archive: Boolean,
      // online params
      customerEmail: String,
      item: String,
      startDate: String,
      endDate: String,
      singleDate: String,
      time: String,
      countString: String,
      shipping: Object,
      sku: String,
      // txnHash
      txnHash: String,
    },
  ],

  intro: { type: Boolean },
});

export default mongoose.models.user || mongoose.model<Users>("user", UserSchema);
