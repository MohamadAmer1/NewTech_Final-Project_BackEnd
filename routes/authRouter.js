import express from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", authMiddleware, getCurrentUser);
export default router;
