import express from 'express'
import {protect} from "../middleware/authMiddleware.js"
import { getModerationQueue, moderateItem } from '../controller/modController.js'

const router = express.Router()

router.route("/queue")
  .get(protect,getModerationQueue)
router.route('/:contentType/:id/moderate')
  .put(protect, moderateItem);

export default router