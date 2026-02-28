import express from "express";
import {
    createRecurring,
    getRecurringList,
    updateRecurringStatus,
    deleteRecurring,
    updateRecurring,
} from "../controllers/recurringController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a recurring transaction rule
router.post("/", protect, createRecurring);

// Get all recurring rules for logged-in user
router.get("/", protect, getRecurringList);

// Pause / Resume recurring rule
router.patch("/:id/status", protect, updateRecurringStatus);

router.put("/:id", protect, updateRecurring);

// Delete recurring rule
router.delete("/:id", protect, deleteRecurring);

export default router;
