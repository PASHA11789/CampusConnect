import express from "express"
import {aiModeration} from "../middleware/aiModeration.js"
import {protect} from "../middleware/authMiddleware.js"
import { 
  getCareerThreads, 
  createCareerThread, 
  replyToThread 
} from '../controller/careerController.js';

const router = express.Router()
router.use(protect);

router.route('/')
  .get(getCareerThreads);

router.route('/')
  .post(aiModeration, createCareerThread);

router.route('/:id/reply')
  .post(aiModeration, replyToThread);

export default router;