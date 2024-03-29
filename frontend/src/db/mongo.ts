import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI ?? "")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("db connection failed");
  });

const userSchema = new mongoose.Schema({
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
const User = mongoose.model("user", userSchema); // creates a "model" to add data with structure "userSchema" to "users" collection

const tempKeySchema = new mongoose.Schema({
  merchantEmail: { type: String },
  tempKey: { type: String },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});
const TempKey = mongoose.model("tempkey", tempKeySchema); // creates a "model" to add data with structure "userSchema" to "users" collection

module.exports = { User, TempKey };
