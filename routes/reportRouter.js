import express from "express";
import { addOneReport, deleteOneReport, getAllReports, getOneReportById, updateOneReport } from "../controllers/reportController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleWare.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("RESIDENT", "STAFF", "FIELD_GUARD"), getAllReports);
router.get("/:id", authMiddleware, authorizeRoles("RESIDENT", "STAFF", "FIELD_GUARD"), getOneReportById);
router.post("/", authMiddleware, authorizeRoles("RESIDENT"), upload.single("photo"), addOneReport);
router.put("/:id", authMiddleware, authorizeRoles("STAFF", "FIELD_GUARD"), updateOneReport);
router.delete("/:id", authMiddleware, authorizeRoles("STAFF"), deleteOneReport);

export default router;
