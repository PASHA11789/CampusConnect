import express from "express"
import { getForumSummary,createForumThread } from "../controller/forumController.js"
import {protect} from "../middleware/authMiddleware.js"

const router = express.Router()

router.route('/')
  .get(protect, getForumSummary)
  .post(protect, createForumThread);


export default router;