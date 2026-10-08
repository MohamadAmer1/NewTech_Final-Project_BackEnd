import express from "express";
import { findVehicleOwner } from "../controllers/vehicleController.js";
import { authMiddleware, authorizeRoles } from "../middleware/authMiddleWare.js";

const router = express.Router();

router.get("/owner", authMiddleware, authorizeRoles("FIELD_GUARD"), findVehicleOwner);

export default router;
