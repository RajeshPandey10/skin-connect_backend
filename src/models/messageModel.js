import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
    },
    messageId: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: false,
    },
    status: {
      type: String,
      enum: ["sent", "receiver", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", messageSchema);
