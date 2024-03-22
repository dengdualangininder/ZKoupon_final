import mongoose from "mongoose";

export interface TempKey extends mongoose.Document {
  merchantEmail: string;
  tempKey: string;
  expireAt: Date;
}

const tempKeySchema = new mongoose.Schema<TempKey>({
  merchantEmail: { type: String },
  tempKey: { type: String },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export default mongoose.models.tempkey || mongoose.model<TempKey>("tempkey", tempKeySchema);
