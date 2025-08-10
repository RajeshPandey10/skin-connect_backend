import mongoose, { Schema } from "mongoose";

const feedBackSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialist: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  rating: {
    type: String,
  },
});

export const Feedback = mongoose.model("Feedback", feedBackSchema);
