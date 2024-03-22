import mongoose from "mongoose";

const connection: { isConnected?: number } = {};

const dbConnect = async () => {
  if (connection.isConnected) {
    console.log("db already connected");
    return;
  }
  console.log("connecting to db");
  const db = await mongoose.connect(process.env.MONGO_URI!);
  connection.isConnected = db.connections[0].readyState;
};

export default dbConnect;
