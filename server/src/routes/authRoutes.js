import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../../utils/cloudinaryConfig.js"; // Your Cloudinary/Multer setup
import {
  updateUserAvatar,
  getUserProfile,
  loginUser,
  registerUser,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile);

router.put(
  "/update-avatar",
  protect,
  upload.single("avatar"),
  updateUserAvatar,
);

export default router;
