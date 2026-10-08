import express from "express";
import {
  addOneReport,
  assignReport,
  deleteOneReport,
  getAllReports,
  getFieldGuards,
  getOneReportById,
  rejectReport,
  updateMaintenanceStatus,
} from "../controllers/reportController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleWare.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("RESIDENT", "STAFF", "FIELD_GUARD"), getAllReports);

router.get("/field-guards", authMiddleware, authorizeRoles("STAFF"), getFieldGuards);

router.get("/:id", authMiddleware, authorizeRoles("RESIDENT", "STAFF", "FIELD_GUARD"), getOneReportById);

router.post("/", authMiddleware, authorizeRoles("RESIDENT"), upload.single("photo"), addOneReport);

router.put("/:id/assign", authMiddleware, authorizeRoles("STAFF"), assignReport);
router.put("/:id/reject", authMiddleware, authorizeRoles("STAFF"), rejectReport);
router.put("/:id/maintenance-status", authMiddleware, authorizeRoles("STAFF"), updateMaintenanceStatus);
router.delete("/:id", authMiddleware, authorizeRoles("STAFF"), deleteOneReport);

export default router;
