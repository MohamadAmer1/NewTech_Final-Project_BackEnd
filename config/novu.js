import "dotenv/config";
import { Novu } from "@novu/api";

if (!process.env.NOVU_SECRET_KEY) {
  throw new Error("NOVU_SECRET_KEY is missing");
}

const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY,
  serverURL: process.env.NOVU_SERVER_URL || "https://api.novu.co",
});

export default novu;