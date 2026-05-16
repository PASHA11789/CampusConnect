import express from "express";
import { getDashboardSummary } from "../controller/dashboaedController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);

export default router;
