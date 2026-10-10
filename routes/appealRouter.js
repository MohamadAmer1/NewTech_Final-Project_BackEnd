import express from "express";
import { addOneAppeal, getAppeals, decideAppeal } from "../controllers/appealController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleWare.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("RESIDENT"), upload.single("photo"), addOneAppeal);

router.get("/", authMiddleware, authorizeRoles("RESIDENT", "STAFF"), getAppeals);

router.put("/:id/decision", authMiddleware, authorizeRoles("STAFF"), decideAppeal);

export default router;
