import express from "express";
import { addOneFine, getMyFines } from "../controllers/fineController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleWare.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("FIELD_GUARD"), upload.single("photo"), addOneFine);

router.get("/", authMiddleware, authorizeRoles("FIELD_GUARD", "RESIDENT"), getMyFines);

export default router;
