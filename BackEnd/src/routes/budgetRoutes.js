import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

// All budget routes are protected
router.use(protect);

// @route   POST /api/budgets
// @desc    Create a new budget
router.post("/", createBudget);

// @route   GET /api/budgets?month=MM&year=YYYY
// @desc    Get budgets for a month (with spending stats)
router.get("/", getBudgets);

// @route   PUT /api/budgets/:id
// @desc    Update budget limit
router.put("/:id", updateBudget);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
router.delete("/:id", deleteBudget);

export default router;
