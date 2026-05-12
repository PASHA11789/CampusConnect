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


// Route to get profile data (to display the image initially)
router.get("/profile", protect, getUserProfile);

// Route to CHANGE the image (The "Edit" option)
// 'avatar' must match the 'name' attribute in Sagheer's frontend form/input
router.put(
  "/update-avatar",
  protect,
  upload.single("avatar"),
  updateUserAvatar,
);

export default router;
