import express from "express";
import { registerUser, loginUser, getMe, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   GET /api/auth/me
router.get("/me", protect, getMe);

// @route   PUT /api/auth/me
router.put("/me", protect, updateProfile);

// @route   PUT /api/auth/change-password
router.put("/change-password", protect, changePassword);

export default router;
