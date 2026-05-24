import express from "express";
import { getDashboardSummary } from "../controller/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);

export default router;
