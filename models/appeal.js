import mongoose from "mongoose";

const appealSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    fine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fines",
      required: true,
      unique: true,
    },

    reason: {
      type: String,
      required: true,
      enum: ["Incorrect information", "Violation was not mine", "Special circumstances", "Already resolved"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("appeals", appealSchema);
