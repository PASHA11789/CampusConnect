import express from "express";
import { aiModeration } from "../middleware/aiModeration.js";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getCareerThreads, 
  createCareerThread, 
  replyToThread,
  reportCareerThread,
  reportCareerReply,
  deleteCareerReply
} from '../controller/careerController.js';

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getCareerThreads)
  .post(aiModeration, createCareerThread);

router.route('/:id/reply')
  .post(aiModeration, replyToThread);

router.route('/:id/report')
  .post(reportCareerThread);

router.route('/:threadId/replies/:replyId/report')
  .post(reportCareerReply);

router.route('/:threadId/replies/:replyId')
  .delete(deleteCareerReply);

export default router;