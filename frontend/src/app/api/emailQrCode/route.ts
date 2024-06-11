const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "contact@lingpay.io",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const emailQrCodeTemplate = () => {
  const html = `<p>Attached is your QR Code</p>`;
  return html;
};

export const POST = async (request: Request) => {
  console.log("entered emailQrCode api");
  const formData = await request.formData();
  const merchantEmail = formData.get("merchantEmail");
  const dataString = formData.get("dataString");

  try {
    await mailTransporter.sendMail({
      from: { name: "Flash Pay", address: "contact@lingpay.io" },
      to: merchantEmail,
      subject: "Your QR Code",
      html: `<p>Attached is your QR Code</p>`,
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
