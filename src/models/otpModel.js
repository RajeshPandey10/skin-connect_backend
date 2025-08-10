import mongoose, { mongo, Schema } from "mongoose";

const optSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300,
    },
  },
  {
    timestamps: true,
  }
);

export const Otp = mongoose.model("Otp", optSchema);
