import mongoose from "mongoose";

let connection: { isConnected?: number } = {};

const dbConnect = async () => {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(process.env.MONGO_URI!);
  connection.isConnected = db.connections[0].readyState;
};

export default dbConnect;
