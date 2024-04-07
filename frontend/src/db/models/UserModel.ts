import mongoose, { Document, Schema } from "mongoose";

export type PaymentSettings = {
  merchantEvmAddress: string;
  merchantEmail: string;
  merchantName: string;
  merchantCountry: string;
  merchantCurrency: string;
  merchantPaymentType: string;
  merchantWebsite: string;
  merchantBusinessType: string;
  merchantFields: string[];
  merchantGoogleId: string;
  employeePass: string;
  qrCodeUrl: string;
};

export type CashoutSettings = {
  cex: string;
  cexEvmAddress: string;
  cexApiKey: string;
  cexSecretKey: string;
  cexAccountName: string;
};

export type Transaction = {
  date: any;
  customerAddress: string;
  merchantAddress: string;
  currencyAmount: number;
  merchantCurrency: string;
  tokenAmount: number;
  token: string;
  network: string;
  blockRate: number;
  cashRate: number;
  savings: string;
  refund: boolean;
  refundNote: boolean;
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

export interface IUser extends Document {
  cbRefreshToken: string;
  web3AuthSessionId: string;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  transactions: Transaction[];
  intro: boolean;
}

const userSchema: Schema = new mongoose.Schema<IUser>({
  cbRefreshToken: String,
  web3AuthSessionId: String,
  paymentSettings: {
    merchantEvmAddress: String,
    merchantEmail: String,
    merchantName: String,
    merchantCountry: String,
    merchantCurrency: String,
    merchantPaymentType: String, // "online" | "inperson"
    merchantWebsite: String,
    merchantBusinessType: String,
    merchantFields: [String], // dates, count, sku, shipping, custom, <custom>,
    merchantGoogleId: String,
    employeePass: String,
    qrCodeUrl: String,
  },
  cashoutSettings: {
    cex: String,
    cexEvmAddress: String,
    cexApiKey: String,
    cexSecretKey: String,
    cexAccountName: String,
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
      merchantEvmAddress: String,
      refund: Boolean,
      refundNote: Boolean,
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

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
