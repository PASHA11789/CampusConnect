import express from "express";
import upload from "../../utils/cloudinaryConfig.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateProfile, getPublicProfile,reportUserProfile } from "../controller/userController.js";

const router = express.Router();

router.use(protect);

router.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Image uploaded successfully",
    imageUrl: req.file.path,
  });
});

router.route('/profile')
  .put(updateProfile);

router.route('/:id/public')
  .get(getPublicProfile);
  
router.route('/:id/report')
  .post(reportUserProfile);

export default router;