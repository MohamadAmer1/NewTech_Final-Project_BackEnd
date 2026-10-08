import mongoose from "mongoose";
import { normalizeLicensePlate } from "../utils/normalizeLicensePlate.js";

const vehicleSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    licensePlate: {
      type: String,
      required: true,
      unique: true,
      set: normalizeLicensePlate,
    },
  },
  { timestamps: true },
);

export default mongoose.model("vehicles", vehicleSchema);