import express from "express"
import {protect} from "../middleware/authMiddleware.js"
import {aiModeration} from "../middleware/aiModeration.js"

import{
    getPetitions,
    createPetition,
    signPetition,
    moderatePetition
} from "../controller/petitionController.js"

const router = express.Router()

router.route("/")
    .get(protect, getPetitions)
    .post(protect, aiModeration, createPetition)
router.route("/:id/sign")
    .put(protect, signPetition)
router.route("/:id/moderate")
    .put(protect, moderatePetition)

export default router    