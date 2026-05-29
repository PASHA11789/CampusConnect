import express from "express"
import { aiModeration } from "../middleware/aiModeration.js"
import { getForumSummary,
         createForumThread,
         updateForumThread,
         deleteForumThread,
         addThreadReply,
         updateThreadReply,
         deleteThreadReply,
         toggleHideThread,
         getForumThreadById
     } from "../controller/forumController.js"
import {protect} from "../middleware/authMiddleware.js"



const router = express.Router()

router.route('/')
  .get(protect, getForumSummary)
  .post(protect, aiModeration ,createForumThread);

router.route('/:id')
  .get(protect, getForumThreadById)
  .put(protect, updateForumThread)
  .delete(protect, deleteForumThread);

router.route("/:id/replies")
  .post(protect, addThreadReply)

router.route("/:threadId/replies/:replyId")
  .put(protect, updateThreadReply)
  .delete(protect, deleteThreadReply)


export default router;