import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import {aiModeration} from "../middleware/aiModeration.js"
import upload from "../../utils/cloudinaryConfig.js"
import {
    getLostFoundItems,
    reportItem,
    resolveItem,
    deleteItem,
    claimFoundItem
} from "../controller/lostAndFoundController.js"

const router = express.Router()

router.route("/")
.get(protect, getLostFoundItems)
.post(protect, upload.single("image"),aiModeration, reportItem)

router.route("/:id/resolve")
.put(protect, resolveItem)

router.route("/:id/claim-found")
.put(protect, claimFoundItem)

router.route("/:id")
.delete(protect, deleteItem)


export default router