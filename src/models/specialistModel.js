import mongoose, { Schema } from "mongoose";

const specialistSchema = new Schema({
  specialist: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  honors: {
    type: String,
    trim: true,
  },
  awards: {
    type: String,
    trim: true,
  },
  works: {
    type: String,
    trim: true,
  },
  education: {
    type: String,
    trim: true,
  },
  experience: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default:"pending",
  },
  availability: {
    morning: { type: Boolean, default: true },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: true },
  },
});

const Specialist = mongoose.model("Specialist", specialistSchema);

export default Specialist;
