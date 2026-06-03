import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import { getUserNotifications, markedAsRead} from "../controller/notificationController.js"

const router = express.Router()

router.route("/").get(protect, getUserNotifications)

router.route("/:id/read").put(protect, markedAsRead)

export default router 