import express from "express"
import { addOneReport, deleteOneReport, getAllReports, getOneReportById, updateOneReport } from "../controllers/reportController.js";
const router = express.Router()

router.get("/",getAllReports)
router.get("/:id",getOneReportById)
router.post("/",addOneReport)
router.put("/:id",updateOneReport)
router.delete("/:id",deleteOneReport)


export default router;