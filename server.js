import express from "express";
import reportRouter from "./routes/reportRouter.js";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;


app.use("/auth", authRouter)
app.use("/reports", reportRouter);
app.get("/", (req, res) => {
  res.status(200).send("HI HOME");
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: "Photo must be 5 MB or smaller",
    });
  }

  return res.status(400).json({
    message: err.message || "Request failed",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
