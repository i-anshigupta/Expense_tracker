import express from "express";
import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below are protected (user must be logged in)
router.use(protect);

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post("/", createTransaction);

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user (with filters)
// @access  Private
router.get("/", getTransactions);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put("/:id", updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete("/:id", deleteTransaction);

export default router;
