import mongoose, { Model, Schema } from "mongoose";

export interface IOtp  {
    name: string;
    email: string;
    otp:number;
    otpGeneratedAt:Date;
    expiresAt:Date
  }

const OtpSchema: Schema<IOtp> = new Schema({
  name: { type: String },
  email: { type: String, required: true },
  otp: { type: Number, required: true },
  otpGeneratedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OtpModel: Model<IOtp> = mongoose.model<IOtp>("Otp", OtpSchema);

export default OtpModel;