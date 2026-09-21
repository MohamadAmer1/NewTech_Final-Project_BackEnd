import express from "express";
import reportRouter from "./routes/reportRouter.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/reports", reportRouter);
app.get("/", (req, res) => {
  res.status(200).send("HI HOME");
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
