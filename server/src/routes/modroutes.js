import express from 'express'
import {protect} from "../middleware/authMiddleware.js"
import { getModerationQueue } from '../controller/modController.js'

const router = express.Router()

router.route("/queue")
  .get(protect,getModerationQueue)

export default router