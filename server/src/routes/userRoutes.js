import upload from "../../utils/cloudinaryConfig.js";
import express from "express";

const router = express.Router();

router.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "Image uplaoded successfully",
    imageUrl: req.file.path,
  });
});

export default router;
