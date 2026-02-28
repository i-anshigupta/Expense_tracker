import RecurringTransaction from "../models/RecurringTransaction.js";

/**
 * @desc    Create a new recurring transaction rule
 * @route   POST /api/recurring
 * @access  Private
 */
export const createRecurring = async (req, res) => {
    try {
        const {
            title,
            amount,
            type,
            category,
            paymentMethod,
            frequency,
            interval,
            startDate,
            endDate,
        } = req.body;

        if (!title || !amount || !type || !category || !frequency || !startDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const recurring = await RecurringTransaction.create({
            user: req.user._id,
            title,
            amount,
            type,
            category,
            paymentMethod,
            frequency,
            interval: interval || 1,
            startDate,
            endDate: endDate || null,
        });

        res.status(201).json({
            success: true,
            data: recurring,
        });
    } catch (error) {
        console.error("Create recurring error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create recurring transaction",
        });
    }
};

/**
 * @desc    Get all recurring transactions for logged-in user
 * @route   GET /api/recurring
 * @access  Private
 */
export const getRecurringList = async (req, res) => {
    try {
        const recurringList = await RecurringTransaction.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: recurringList,
        });
    } catch (error) {
        console.error("Get recurring error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recurring transactions",
        });
    }
};

/**
 * @desc    Pause or resume a recurring rule
 * @route   PATCH /api/recurring/:id/status
 * @access  Private
 */
export const updateRecurringStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["active", "paused"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const recurring = await RecurringTransaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status },
            { new: true }
        );

        if (!recurring) {
            return res.status(404).json({
                success: false,
                message: "Recurring transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            data: recurring,
        });
    } catch (error) {
        console.error("Update recurring status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status",
        });
    }
};

/**
 * @desc    Delete a recurring transaction rule
 * @route   DELETE /api/recurring/:id
 * @access  Private
 */
export const deleteRecurring = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!recurring) {
            return res.status(404).json({
                success: false,
                message: "Recurring transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Recurring transaction deleted",
        });
    } catch (error) {
        console.error("Delete recurring error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete recurring transaction",
        });
    }
};

/**
 * @desc    Update a recurring transaction rule
 * @route   PUT /api/recurring/:id
 * @access  Private
 */
export const updateRecurring = async (req, res) => {
    try {
        const updated = await RecurringTransaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Recurring rule not found",
            });
        }

        res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error("Update recurring error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update recurring transaction",
        });
    }
};
