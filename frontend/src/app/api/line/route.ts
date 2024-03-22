import axios from "axios";
import { messagingApi } from "@line/bot-sdk";

export const POST = async (request: Request) => {
  console.log("line api");

  const lineAccessToken = process.env.LINE_ACCESS_TOKEN;

  const { MessagingApiClient } = messagingApi;

  try {
    const client = new MessagingApiClient({
      channelAccessToken: lineAccessToken,
    });
    client.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [{ type: "text", text: "hello, world" }],
    });
    return Response.json("sent");
  } catch (err) {
    console.log(err);
    return Response.json("error");
  }
};
