import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
  {
    fieldGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    licensePlate: {
      type: String,
      required: true,
      trim: true,
    },

    violationType: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: "Amount must be a finite number",
      },
    },

    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Fine = mongoose.model("fines", fineSchema);

export default Fine;