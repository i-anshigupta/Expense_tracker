import express from "express";
import {
    getSummary,
    getByCategory,
    getTrend,
    getMonthComparison,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All analytics routes are protected
router.use(protect);

// @route   GET /api/analytics/summary
// @desc    Get summary: total income, total expenses, savings
router.get("/summary", getSummary);

// @route   GET /api/analytics/by-category
// @desc    Get expenses grouped by category
router.get("/by-category", getByCategory);

// @route   GET /api/analytics/trend
// @desc    Get income & expense trend over time
router.get("/trend", getTrend);

// @route   GET /api/analytics/month-compare
// @desc    Compare current month vs previous month
router.get("/month-compare", getMonthComparison);

export default router;
