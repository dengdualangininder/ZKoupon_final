const nodemailer = require("nodemailer"); // nodemailer does not suppot es6
import { google } from "googleapis";

export const POST = async (request: Request) => {
  console.log("entered /api/emailQrCode");

  const { merchantEmail, dataString } = await request.json();

  const createTransporter = async () => {
    // get access token
    // 1. define OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // this is required if using refresh tokens generated from oauthplayground
    );
    // 2. set credentials, refresh token should last forever
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    // 3. get access token (wrap in promise because article says "await" does not work, but other code examples use await)
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err: any, token: any) => {
        if (err) {
          reject();
        }
        resolve(token);
      });
    });

    // 4. create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "support@flashpayments.xyz",
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });

    return transporter;
  };

  try {
    var mailTransporter = await createTransporter();
  } catch (e) {
    console.log("error in creating mailTransporter:", e);
    return Response.json("email not sent");
  }

  const html = `
  <div>
    <p>Attached is your QR code (a PDF file). When a customer scans it, they will be able to pay you any amount.</p>
    <p>
      Every store will likely have their own way to display the QR code. One way is to insert an A6-sized print into
      <a href="https://www.amazon.com/s?k=a6+acrylic+sign+holders" target="_blank">an acrylic sign holder</a> and place it next to your cash register.
    </p>
    <p>If you have any questions, please email support@flashpayments.xyz</p>
    <p>Sincerely,<br />Flash Payments</p>
  </div>
  `;

  try {
    await mailTransporter.sendMail({
      from: { name: "Flash Payments", address: "support@flashpayments.xyz" },
      to: merchantEmail,
      subject: "Your QR Code",
      html: html,
      attachments: [
        {
          filename: "FlashQrCode.pdf",
          content: dataString,
          endcode: "base64",
          contentType: "application/pdf",
        },
      ],
    });
    console.log("email sent");
    return Response.json("email sent");
  } catch (e) {
    console.log(e);
    console.log("email not sent");
    return Response.json("email not sent");
  }
};
