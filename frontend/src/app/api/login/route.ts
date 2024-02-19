import { NextResponse, NextRequest } from "next/server";
import User from "@/src/app/db/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("/login endpoint requested");
  const data = req.json(); // without express.json(), req.body is undefined
  console.log(data);
  return NextResponse.json("hello");
  // try {
  //   var userDoc = await User.findOne({ merchantEmail: data.merchantEmail });
  // } catch (e) {
  //   res.status(500).json({ message: "server error", e });
  //   console.log("/login no user");
  // }
  // if (userDoc) {
  //   try {
  //     const isPasswordCorrect = await bcrypt.compare(data.password, userDoc.password);
  //     if (isPasswordCorrect) {
  //       const token = jwt.sign({ _id: userDoc._id.toString() }, process.env.JWT_KEY, { expiresIn: "7d" });
  //       res.cookie("jwt", token, {
  //         maxAge: 7 * 24 * 60 * 60 * 1000,
  //         httpOnly: true,
  //         sameSite: "strict",
  //         secure: true,
  //       });
  //       res.json("match");
  //       console.log("admin password matched");
  //     } else if (data.password === userDoc.employeePass) {
  //       const token = jwt.sign({ merchantEmail: data.merchantEmail }, process.env.JWT_KEY, { expiresIn: "7d" });
  //       res.cookie("jwtEmployee", token, {
  //         maxAge: 7 * 24 * 60 * 60 * 1000, // may consider reducing
  //         httpOnly: true,
  //         sameSite: "strict",
  //         secure: true,
  //       });
  //       res.json("match");
  //       console.log("employee password matched");
  //     } else {
  //       res.json("nomatch");
  //     }
  //   } catch (e) {
  //     res.status(500).json({ message: "server error", e });
  //     console.log(e);
  //   }
  // } else {
  //   res.json("nomatch");
  // }
}
