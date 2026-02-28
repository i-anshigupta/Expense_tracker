import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // helpful for queries by user
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0, "Amount cannot be negative"],
        },
        type: {
            type: String,
            enum: ["income", "expense"],
            required: [true, "Type is required"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi", "bank_transfer", "other"],
            default: "other",
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Compound index for efficient filtering by user + date
transactionSchema.index({ user: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
