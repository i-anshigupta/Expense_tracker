import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

/**
 * Helper: get start/end Date for a given month/year
 */
const getMonthRange = (month, year) => {
    // month: 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0); // last day of month
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

/**
 * @desc Create budget
 * @route POST /api/budgets
 * @access Private
 * body: { category, limit, month (1-12), year }
 */
export const createBudget = async (req, res) => {
    try {
        const { category, limit, month, year } = req.body;
        const userId = req.user._id;

        if (!category || limit === undefined || !month || !year) {
            return res.status(400).json({
                status: "error",
                message: "category, limit, month and year are required",
            });
        }

        // Normalize category string
        const normalizedCategory = String(category).trim();

        // Ensure positive limit
        if (Number(limit) < 0) {
            return res.status(400).json({
                status: "error",
                message: "Budget limit must be non-negative",
            });
        }

        // Create budget (unique index will prevent duplicates)
        const budget = await Budget.create({
            user: userId,
            category: normalizedCategory,
            limit: Number(limit),
            month: Number(month),
            year: Number(year),
        });

        res.status(201).json({
            status: "success",
            data: { budget },
        });
    } catch (error) {
        console.error("Create budget error:", error.message);

        // Handle unique index duplicate
        if (error.code === 11000) {
            return res.status(409).json({
                status: "error",
                message: "A budget for this category and month already exists",
            });
        }

        res.status(500).json({
            status: "error",
            message: "Server error while creating budget",
        });
    }
};

/**
 * @desc Get budgets for a month (with spent amount & percent used)
 * @route GET /api/budgets?month=MM&year=YYYY
 * @access Private
 */
export const getBudgets = async (req, res) => {
    try {
        const userId = req.user._id;
        let { month, year } = req.query;

        const now = new Date();
        month = month ? Number(month) : now.getMonth() + 1; // default current month
        year = year ? Number(year) : now.getFullYear();

        // Fetch budgets for this user & month/year
        const budgets = await Budget.find({
            user: userId,
            month,
            year,
        }).lean();

        // If no budgets, return empty array early
        if (!budgets || budgets.length === 0) {
            return res.status(200).json({
                status: "success",
                results: 0,
                data: { budgets: [] },
            });
        }

        // Get list of categories in budgets
        const categories = budgets.map((b) => b.category);

        const { start, end } = getMonthRange(month, year);

        // Aggregate transactions once to get spent per category
        const agg = await Transaction.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    type: "expense",
                    category: { $in: categories },
                    date: { $gte: start, $lte: end },
                },
            },
            {
                $group: {
                    _id: "$category",
                    spent: { $sum: "$amount" },
                },
            },
        ]);

        // Map aggregates for quick lookup
        const spentMap = {};
        agg.forEach((a) => {
            spentMap[a._id] = a.spent;
        });

        // Combine budgets with spent and percentage
        const budgetsWithStats = budgets.map((b) => {
            const spent = spentMap[b.category] || 0;
            const percentUsed = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            const remaining = b.limit - spent;
            return {
                ...b,
                spent,
                remaining,
                percentUsed: Math.round(percentUsed * 100) / 100, // 2 decimal places
                isExceeded: spent > b.limit,
            };
        });

        res.status(200).json({
            status: "success",
            results: budgetsWithStats.length,
            data: { budgets: budgetsWithStats },
        });
    } catch (error) {
        console.error("Get budgets error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching budgets",
        });
    }
};

/**
 * @desc Update budget (limit)
 * @route PUT /api/budgets/:id
 * @access Private
 * body: { limit }
 */
export const updateBudget = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const { limit } = req.body;

        if (limit === undefined) {
            return res.status(400).json({
                status: "error",
                message: "limit is required",
            });
        }

        const budget = await Budget.findOne({ _id: id, user: userId });

        if (!budget) {
            return res.status(404).json({
                status: "error",
                message: "Budget not found",
            });
        }

        budget.limit = Number(limit);
        await budget.save();

        res.status(200).json({
            status: "success",
            data: { budget },
        });
    } catch (error) {
        console.error("Update budget error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while updating budget",
        });
    }
};

/**
 * @desc Delete budget
 * @route DELETE /api/budgets/:id
 * @access Private
 */
export const deleteBudget = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const budget = await Budget.findOneAndDelete({ _id: id, user: userId });

        if (!budget) {
            return res.status(404).json({
                status: "error",
                message: "Budget not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Budget deleted successfully",
        });
    } catch (error) {
        console.error("Delete budget error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while deleting budget",
        });
    }
};
