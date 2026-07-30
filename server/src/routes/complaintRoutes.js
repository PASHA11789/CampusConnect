import express from "express";
import { protect, authorizeCampusRoles } from "../middleware/authMiddleware.js";
import { aiModeration } from "../middleware/aiModeration.js";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  pingAdminsForComplaint,
  upvoteComplaint,
  deleteComplaint,
  getComplaintStats,
} from "../controller/complaintController.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAllComplaints)
  .post(protect, aiModeration, createComplaint);

router.route("/my").get(protect, getMyComplaints);

router
  .route("/stats")
  .get(protect, authorizeCampusRoles("admin", "campus_admin", "student_mod"), getComplaintStats);

router.route("/:id").get(protect, getComplaintById).delete(protect, deleteComplaint);

router
  .route("/:id/status")
  .put(protect, authorizeCampusRoles("admin", "campus_admin", "student_mod"), updateComplaintStatus);

router
  .route("/:id/ping-admin")
  .post(protect, authorizeCampusRoles("admin", "campus_admin", "student_mod"), pingAdminsForComplaint);

router.route("/:id/upvote").post(protect, upvoteComplaint);

export default router;
