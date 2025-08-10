import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    specialist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: {
      type: "String",
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted"],
      default: "pending",
    },
    apppointmentDate: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.pre("save", function (next) {
  const date = this.apppointmentDate || new Date();
  this.month = date.getMonth() + 1;
  next();
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);
