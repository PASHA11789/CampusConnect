import express from "express"
import { aiModeration } from "../middleware/aiModeration.js"
import { getForumSummary,
         createForumThread,
         updateForumThread,
         deleteForumThread,
         addThreadReply,
         updateThreadReply,
         deleteThreadReply,
         getForumThreadById,
         reportForumThread,
         reportThreadReply

     } from "../controller/forumController.js"
import {protect} from "../middleware/authMiddleware.js"



const router = express.Router()

router.route('/')
  .get(protect, getForumSummary)
  .post(protect, aiModeration ,createForumThread);

router.route('/:id')
  .get(protect, getForumThreadById)
  .put(protect, aiModeration, updateForumThread)
  .delete(protect, deleteForumThread);

router.route("/:id/replies")
  .post(protect, aiModeration, addThreadReply)

router.route("/:threadId/replies/:replyId")
  .put(protect, aiModeration, updateThreadReply)
  .delete(protect, deleteThreadReply)
router.route('/:id/report')
  .post(protect, reportForumThread)

router.route('/:threadId/replies/:replyId/report')
  .post(protect, reportThreadReply)

export default router;