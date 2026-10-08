import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedTeam: {
      type: String,
      enum: ["FIELD_GUARD", "MAINTENANCE"],
      default: null,
    },
    assignedFieldGuard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    phone: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["NEW", "DISPATCHED", "IN PROGRESS", "RESOLVED", "REJECTED"],
      default: "NEW",
    },

    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
    
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

const Report = mongoose.model("reports", reportSchema);

export default Report;
