import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    licensePlate: { type: String, required: true, trim: true },
    priority: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    photoUrl: { type: String, trim: true, default:"" },
  },
  { timestamps: true },
);

const Report = mongoose.model("reports", reportSchema);
export default Report;
