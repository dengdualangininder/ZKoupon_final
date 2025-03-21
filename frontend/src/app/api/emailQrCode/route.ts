const nodemailer = require("nodemailer"); // nodemailer does not suppot es6
import { google } from "googleapis";

export const POST = async (request: Request) => {
  console.log("entered /api/emailQrCode");
  const { merchantEmail, dataString } = await request.json();

  // create transporter
  try {
    // get access token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // this is required if using refresh tokens generated from oauthplayground
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    // wrap in promise because article says "await" does not work, but other code examples use await
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err: any, token: any) => {
        if (err) reject();
        resolve(token);
      });
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "support@nullapay.com",
        accessToken,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  } catch (e) {
    console.log("error in creating transporter");
    return Response.json("email not sent");
  }

  const html = `
  <div>
    <p>Attached is your QR code (a PDF file). When a customer scans it, they will be able to pay you any amount.</p>
    <p>
      Every store will likely have their own way to display the QR code. One way is to insert an A6-sized print into
      <a href="https://www.amazon.com/s?k=a6+acrylic+sign+holders" target="_blank">an acrylic sign holder</a> and place it next to your cash register.
    </p>
    <p>If you have any questions, please email support@nullapay.com</p>
    <p>Sincerely,<br />Nulla Pay</p>
  </div>
  `;

  // send mail
  try {
    await transporter.sendMail({
      from: { name: "Nulla Pay", address: "support@nullapay.com" },
      to: merchantEmail,
      subject: "Your QR Code",
      html: html,
      attachments: [
        {
          filename: "NullaQrCode.pdf",
          content: dataString,
          endcode: "base64",
          contentType: "application/pdf",
        },
      ],
    });
    console.log("email sent");
    return Response.json("email sent");
  } catch (e) {
    return Response.json("email not sent");
  }
};
