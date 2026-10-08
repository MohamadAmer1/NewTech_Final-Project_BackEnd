import mongoose from "mongoose";

const residentProfileSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: { type: String, trim: true },
    zone: { type: String, trim: true },
    district: { type: String, trim: true },

    propertyType: { type: String, trim: true },

    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    floor: { type: String, trim: true },

    coverPhotoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model(
  "residentProfiles",
  residentProfileSchema,
);