// import { cookies } from "next/headers";
// import User from "@/src/app/db/models/user";

// export async function POST(req: Request, res: Response) {
//   console.log("/signup endpoint requested");
//   const { merchantEmail, password, paymentSettings, cashoutSettings } = await req.json();
//   let userDoc = await User.findOne({ merchantEmail: merchantEmail });
//   if (userDoc) {
//     res.json("user exists");
//   } else {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.create({
//       dateCreated: new Date(),
//       merchantEmail: merchantEmail,
//       password: hashedPassword,
//       balance: { balance: 0, history: [] },
//       "paymentSettings.merchantName": "",
//       "paymentSettings.merchantCountry": paymentSettings.merchantCountry,
//       "paymentSettings.merchantCurrency": paymentSettings.merchantCurrency,
//       "paymentSettings.merchantAddress": "",
//       "paymentSettings.merchantNetworks": paymentSettings.merchantNetworks,
//       "paymentSettings.merchantTokens": paymentSettings.merchantTokens,
//       "paymentSettings.paymentType": "onsite",
//       "paymentSettings.merchantType": "",
//       "paymentSettings.merchantWebsite": "",
//       "paymentSettings.merchantFields": [],
//       "paymentSettings.stablecoinmap": "",
//       "paymentSettings.url": "",
//       "cashoutSettings.CEX": cashoutSettings.CEX,
//       "cashoutSettings.CEXAddress": "",
//       "cashoutSettings.CEXKey": "",
//       "cashoutSettings.CEXSecret": "",
//       transactions: [],
//       intro: true,
//     })
//       .then((userDoc) => {
//         const token = jwt.sign({ _id: userDoc._id.toString() }, process.env.JWT_KEY, { expiresIn: "7d" });
//         res.cookie("jwt", token, {
//           maxAge: 7 * 24 * 60 * 60 * 1000,
//           httpOnly: true, // doesn't allow javasript to access cookie
//           sameSite: "strict", // was "non" when ISDEV=true
//           secure: true, // if sameSite=none, must have secure:true
//         });
//         res.json("user created");
//         console.log("/signup user created");
//       })
//       .catch(() => {
//         res.json("user not created");
//         console.log("/signup user not created");
//       });
//   }
// }
