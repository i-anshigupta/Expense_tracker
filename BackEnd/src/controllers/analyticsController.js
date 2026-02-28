import Transaction from "../models/Transaction.js";

/**
 * Helper: build common match filter for user + optional date range
 */
const buildMatchQuery = (userId, startDate, endDate) => {
    const match = { user: userId };

    if (startDate || endDate) {
        match.date = {};
        if (startDate) {
            match.date.$gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            match.date.$lte = end;
        }
    }

    return match;
};

/**
 * @desc    Get summary: total income, total expenses, savings
 * @route   GET /api/analytics/summary
 * @access  Private
 * Query params: startDate, endDate (optional)
 */
export const getSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const match = buildMatchQuery(req.user._id, startDate, endDate);

        const result = await Transaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" },
                },
            },
        ]);

        let totalIncome = 0;
        let totalExpense = 0;

        result.forEach((item) => {
            if (item._id === "income") totalIncome = item.total;
            if (item._id === "expense") totalExpense = item.total;
        });

        const savings = totalIncome - totalExpense;

        res.status(200).json({
            status: "success",
            data: {
                totalIncome,
                totalExpense,
                savings,
            },
        });
    } catch (error) {
        console.error("Analytics summary error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching summary",
        });
    }
};

/**
 * @desc    Get expenses grouped by category (for pie chart)
 * @route   GET /api/analytics/by-category
 * @access  Private
 * Query params: startDate, endDate (optional)
 */
export const getByCategory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const match = buildMatchQuery(req.user._id, startDate, endDate);
        match.type = "expense"; // only expenses for category pie

        const result = await Transaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$category",
                    total: { $sum: "$amount" },
                },
            },
            {
                $sort: { total: -1 },
            },
        ]);

        const totalExpense = result.reduce((sum, item) => sum + item.total, 0);

        const categories = result.map((item) => ({
            category: item._id,
            total: item.total,
            percentage: totalExpense ? (item.total / totalExpense) * 100 : 0,
        }));

        res.status(200).json({
            status: "success",
            data: {
                totalExpense,
                categories,
            },
        });
    } catch (error) {
        console.error("Analytics by-category error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching category analytics",
        });
    }
};

/**
 * @desc    Get income & expense trend over time (monthly)
 * @route   GET /api/analytics/trend
 * @access  Private
 * Query params: startDate, endDate (optional)
 */
export const getTrend = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const match = buildMatchQuery(req.user._id, startDate, endDate);

        const result = await Transaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                    },
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                        },
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                        },
                    },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);

        const trend = result.map((item) => ({
            year: item._id.year,
            month: item._id.month,
            income: item.income,
            expense: item.expense,
        }));

        res.status(200).json({
            status: "success",
            data: {
                trend,
            },
        });
    } catch (error) {
        console.error("Analytics trend error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching trend analytics",
        });
    }
};

/**
 * @desc    Compare current month vs previous month
 * @route   GET /api/analytics/month-compare
 * @access  Private
 */
export const getMonthComparison = async (req, res) => {
    try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month

        const userId = req.user._id;

        const [current, previous] = await Promise.all([
            Transaction.aggregate([
                {
                    $match: {
                        user: userId,
                        date: { $gte: currentMonthStart, $lte: now },
                    },
                },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" },
                    },
                },
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        user: userId,
                        date: { $gte: previousMonthStart, $lte: previousMonthEnd },
                    },
                },
                {
                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" },
                    },
                },
            ]),
        ]);

        const summarize = (arr) => {
            let income = 0;
            let expense = 0;
            arr.forEach((item) => {
                if (item._id === "income") income = item.total;
                if (item._id === "expense") expense = item.total;
            });
            return {
                income,
                expense,
                savings: income - expense,
            };
        };

        const currentSummary = summarize(current);
        const previousSummary = summarize(previous);

        res.status(200).json({
            status: "success",
            data: {
                currentMonth: currentSummary,
                previousMonth: previousSummary,
            },
        });
    } catch (error) {
        console.error("Analytics month-compare error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Server error while fetching month comparison",
        });
    }
};
