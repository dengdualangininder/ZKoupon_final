import mongoose, { Document, Schema } from "mongoose";

// merchantWebsite: string;
// merchantBusinessType: string;
// merchantFields: string[];
export type PaymentSettings = {
  merchantPaymentType: string; // "online" | "inperson"
  merchantEvmAddress: string;
  merchantEmail: string;
  merchantName: string;
  merchantCountry: string;
  merchantCurrency: string;
  merchantGoogleId: string;
  qrCodeUrl: string;
  hasEmployeePass: boolean;
};

export type CashoutSettings = {
  cex: string;
  cexEvmAddress: string;
};

// online params
// customerEmail?: string;
// item?: string;
// startDate?: string;
// endDate?: string;
// singleDate?: string;
// time?: string;
// countString?: string;
// shipping?: any;
// sku?: string;
// 18 properties
export type Transaction = {
  date: any;
  customerAddress: string;
  merchantEvmAddress: string;
  currencyAmount: number;
  currencyAmountAfterCashback?: number;
  merchantCurrency: string;
  tokenAmount: number;
  token: string;
  network: string;
  blockRate: number;
  cashRate: number;
  fxSavings: string;
  cashback: string;
  totalSavings: string;
  refund: string; // "" if not refunded, txnHash if refunded
  toRefund: boolean;
  note: string;
  txnHash: string;
};

export interface IUser extends Document {
  hashedEmployeePass: string;
  paymentSettings: PaymentSettings;
  cashoutSettings: CashoutSettings;
  transactions: Transaction[];
}

const UserSchema: Schema = new Schema<IUser>({
  hashedEmployeePass: String,
  paymentSettings: {
    merchantPaymentType: String,
    merchantEvmAddress: String,
    merchantEmail: { type: String, unique: true },
    merchantName: String,
    merchantCountry: String,
    merchantCurrency: String,
    merchantGoogleId: String,
    qrCodeUrl: String,
    hasEmployeePass: Boolean,
  },
  cashoutSettings: {
    cex: String,
    cexEvmAddress: String,
  },
  transactions: [
    {
      date: Date,
      customerAddress: String,
      currencyAmount: Number,
      currencyAmountAfterCashback: Number,
      merchantCurrency: String,
      tokenAmount: Number,
      token: String,
      network: String,
      blockRate: Number,
      cashRate: Number,
      fxSavings: String,
      cashback: String,
      totalSavings: String,
      merchantEvmAddress: String,
      refund: String,
      toRefund: Boolean,
      note: String,
      txnHash: String,
    },
  ],
});

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
