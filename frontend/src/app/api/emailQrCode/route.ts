const nodemailer = require("nodemailer");

export const POST = async (request: Request) => {
  console.log("entered emailQrCode api");

  const { merchantEmail, dataString } = await request.json();
  console.log("merchantEmail:", merchantEmail);

  try {
    var mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "contact@lingpay.io",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
  } catch (e) {
    console.log("error in creating mailTransporter:", e);
    return Response.json("email not sent");
  }

  const html = `
  <div>
    <p>Attached is your QR code (a PDF file). We recommend you forward this attachment to a print shop and print it with a size of A6 (or any A size).</p>
    <p>
      Every store will likely have their own way to display the QR code. One common way is to insert an A6-sized print into
      <a href="https://www.amazon.com/s?k=a6+acrylic+sign+holders" target="_blank">an acrylic sign holder</a> and place it next to your cash register or PoS device.
    </p>
    <p>If you have any questions, please email support@flashpayments.xyz</p>
    <p>Sincerely,<br />Flash Payments</p>
  </div>
  `;

  try {
    await mailTransporter.sendMail({
      from: { name: "Flash Pay", address: "contact@lingpay.io" },
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
