import express from "express";
import upload from "../../utils/cloudinaryConfig.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateProfile, getPublicProfile, reportUserProfile, warnUser, acknowledgeWarning, subscribePushNotification, getVapidPublicKey, testPushNotification } from "../controller/userController.js";



const router = express.Router();

// Public route — no auth needed (frontend needs this to create a push subscription)
router.get("/vapid-public-key", getVapidPublicKey);

router.use(protect);

router.post("/subscribe", subscribePushNotification);
router.post("/test-push", testPushNotification);



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

router.route('/acknowledge-warning')
  .put(acknowledgeWarning);

router.route('/:id/public')
  .get(getPublicProfile);
  
router.route('/:id/report')
  .post(reportUserProfile);

router.route('/:id/warn')
  .post(warnUser);

export default router;