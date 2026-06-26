import express from "express";
import { protectVendor } from "../middleware/authMiddleware.js";
import upload from "../../utils/cloudinaryConfig.js";
import {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorAvatar,
} from "../controller/vendorAuthController.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/login", loginVendor);

router.get("/profile", protectVendor, getVendorProfile);

router.put(
  "/update-avatar",
  protectVendor,
  upload.single("avatar"),
  updateVendorAvatar
);

export default router;
