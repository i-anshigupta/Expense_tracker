import Transaction from "../models/Transaction.js";

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
export const createTransaction = async (req, res) => {
    try {
        const { amount, type, category, date, description, paymentMethod } = req.body;

        if (!amount || !type || !category || !date) {
            return res.status(400).json({
                status: "error",
                message: "Amount, type, category and date are required",
            });
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            type,
            category,
            date,
            description: description || "",
            paymentMethod: paymentMethod || "other",
        });

        res.status(201).json({
            status: "success",
            data: { transaction },
        });
    } catch (error) {
        console.error("Create transaction error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while creating transaction",
        });
    }
};

/**
 * @desc    Get all transactions for logged-in user (with filters)
 * @route   GET /api/transactions
 * @access  Private
 *
 * Query params:
 *  - type: income | expense
 *  - category: string
 *  - startDate: ISO date string
 *  - endDate: ISO date string
 */
export const getTransactions = async (req, res) => {
    try {
        const { type, category, startDate, endDate } = req.query;

        const query = { user: req.user._id };

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                // include till end of that day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Sort by date descending (latest first)
        const transactions = await Transaction.find(query).sort({ date: -1 });

        res.status(200).json({
            status: "success",
            results: transactions.length,
            data: { transactions },
        });
    } catch (error) {
        console.error("Get transactions error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching transactions",
        });
    }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Find transaction belonging to this user
        let transaction = await Transaction.findOne({ _id: id, user: req.user._id });

        if (!transaction) {
            return res.status(404).json({
                status: "error",
                message: "Transaction not found",
            });
        }

        const { amount, type, category, date, description, paymentMethod } = req.body;

        if (amount !== undefined) transaction.amount = amount;
        if (type !== undefined) transaction.type = type;
        if (category !== undefined) transaction.category = category;
        if (date !== undefined) transaction.date = date;
        if (description !== undefined) transaction.description = description;
        if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;

        const updated = await transaction.save();

        res.status(200).json({
            status: "success",
            data: { transaction: updated },
        });
    } catch (error) {
        console.error("Update transaction error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while updating transaction",
        });
    }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            user: req.user._id,
        });

        if (!transaction) {
            return res.status(404).json({
                status: "error",
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        console.error("Delete transaction error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while deleting transaction",
        });
    }
};
