import NextResponse from "next/server";
import { User } from "../../../db/mongo";

export async function POST(req: any) {
  console.log("/signup endpoint requested");
  const { merchantEmail, password, paymentSettings, cashoutSettings } = req.json();
  let userDoc = await User.findOne({ merchantEmail: merchantEmail });
  if (userDoc) {
    NextResponse.json("user exists");
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      dateCreated: new Date(),
      merchantEmail: merchantEmail,
      password: hashedPassword,
      balance: { balance: 0, history: [] },
      "paymentSettings.merchantName": "",
      "paymentSettings.merchantCountry": paymentSettings.merchantCountry,
      "paymentSettings.merchantCurrency": paymentSettings.merchantCurrency,
      "paymentSettings.merchantAddress": "",
      "paymentSettings.merchantNetworks": paymentSettings.merchantNetworks,
      "paymentSettings.merchantTokens": paymentSettings.merchantTokens,
      "paymentSettings.paymentType": "onsite",
      "paymentSettings.merchantType": "",
      "paymentSettings.merchantWebsite": "",
      "paymentSettings.merchantFields": [],
      "paymentSettings.stablecoinmap": "",
      "paymentSettings.url": "",
      "cashoutSettings.CEX": cashoutSettings.CEX,
      "cashoutSettings.CEXAddress": "",
      "cashoutSettings.CEXKey": "",
      "cashoutSettings.CEXSecret": "",
      transactions: [],
      intro: true,
    })
      .then((userDoc) => {
        const token = jwt.sign({ _id: userDoc._id.toString() }, process.env.JWT_KEY, { expiresIn: "7d" });
        res.cookie("jwt", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true, // doesn't allow javasript to access cookie
          sameSite: "strict", // was "non" when ISDEV=true
          secure: true, // if sameSite=none, must have secure:true
        });
        NextResponse.json("user created");
        console.log("/signup user created");
      })
      .catch(() => {
        NextResponse.json("user not created");
        console.log("/signup user not created");
      });
  }
}
