import express, { Router } from "express";
import { loginUser, registerUser } from "../controller/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
