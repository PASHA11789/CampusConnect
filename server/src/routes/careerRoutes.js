import express from "express";
import { aiModeration } from "../middleware/aiModeration.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCareerThreads,
  getCareerThreadById,
  createCareerThread,
  replyToThread,
  toggleLikeCareerThread,
  toggleSaveCareerThread,
  getSavedCareerThreads,
  getCareerProfile,
  updateCareerProfile,
  getDailyChallenge,
  deleteCareerThread,
  reportCareerThread,
  reportCareerReply,
  deleteCareerReply,
} from "../controller/careerController.js";

const router = express.Router();
router.use(protect);

router.route("/")
  .get(getCareerThreads)
  .post(aiModeration, createCareerThread);

router.route("/profile")
  .get(getCareerProfile)
  .put(updateCareerProfile);

router.route("/saved")
  .get(getSavedCareerThreads);

router.route("/daily-challenge")
  .get(getDailyChallenge);

router.route("/:id")
  .get(getCareerThreadById)
  .delete(deleteCareerThread);

router.route("/:id/reply")
  .post(aiModeration, replyToThread);

router.route("/:id/like")
  .post(toggleLikeCareerThread);

router.route("/:id/save")
  .post(toggleSaveCareerThread);

router.route("/:id/report")
  .post(reportCareerThread);

router.route("/:threadId/replies/:replyId/report")
  .post(reportCareerReply);

router.route("/:threadId/replies/:replyId")
  .delete(deleteCareerReply);

export default router;