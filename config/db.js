import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MONGODB CONNECTED SUCCESSFULLY");
  } catch (err) {
    console.error("DB CONNECTION FAILED", err.message);
    process.exit(1);
  }
}
