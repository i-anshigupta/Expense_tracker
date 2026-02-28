import RecurringTransaction from "../models/RecurringTransaction.js";
import Transaction from "../models/Transaction.js";

/**
 * Executes due recurring transactions for a user
 * Runs safely without creating duplicates
 */
export const runRecurringExecutor = async (userId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch active recurring rules
        const recurringRules = await RecurringTransaction.find({
            user: userId,
            status: "active",
        });

        for (const rule of recurringRules) {
            const {
                frequency,
                interval,
                startDate,
                endDate,
                lastExecutedAt,
            } = rule;

            // Skip if not started yet
            if (today < new Date(startDate)) continue;

            // Skip if end date passed
            if (endDate && today > new Date(endDate)) continue;

            // Determine last run date
            const lastRun = lastExecutedAt
                ? new Date(lastExecutedAt)
                : new Date(startDate);

            lastRun.setHours(0, 0, 0, 0);

            // Calculate next run date
            const nextRun = new Date(lastRun);

            switch (frequency) {
                case "daily":
                    nextRun.setDate(nextRun.getDate() + interval);
                    break;
                case "weekly":
                    nextRun.setDate(nextRun.getDate() + 7 * interval);
                    break;
                case "monthly":
                    nextRun.setMonth(nextRun.getMonth() + interval);
                    break;
                case "yearly":
                    nextRun.setFullYear(nextRun.getFullYear() + interval);
                    break;
                default:
                    continue;
            }

            // Not due yet
            if (today < nextRun) continue;

            // Create normal transaction
            await Transaction.create({
                user: rule.user,
                amount: rule.amount,
                type: rule.type,
                category: rule.category,
                paymentMethod: rule.paymentMethod,
                description: rule.title,
                date: today,
                isRecurring: true,
                recurringId: rule._id,
            });

            // Update last executed date
            rule.lastExecutedAt = today;
            await rule.save();
        }
    } catch (error) {
        console.error("Recurring executor error:", error);
    }
};
