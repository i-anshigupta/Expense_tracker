import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        limit: {
            type: Number,
            required: true,
            min: [0, "Budget limit must be positive"],
        },
        month: {
            type: Number, // 1 - 12
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure one budget per user per category per month
budgetSchema.index(
    { user: 1, category: 1, month: 1, year: 1 },
    { unique: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
