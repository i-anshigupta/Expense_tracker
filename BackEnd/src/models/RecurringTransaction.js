import mongoose from "mongoose";

const recurringTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        type: {
            type: String,
            enum: ["income", "expense"],
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        paymentMethod: {
            type: String,
            default: "other",
        },

        // Recurrence configuration
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly", "yearly"],
            required: true,
        },

        interval: {
            type: Number,
            default: 1, // every 1 month/week/day/year
            min: 1,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            default: null,
        },

        lastExecutedAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "paused"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const RecurringTransaction = mongoose.model(
    "RecurringTransaction",
    recurringTransactionSchema
);

export default RecurringTransaction;
