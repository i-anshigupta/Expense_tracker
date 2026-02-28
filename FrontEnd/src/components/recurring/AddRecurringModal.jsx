import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddRecurringModal = ({ isOpen, onClose, onSuccess, editRule }) => {
    const { token } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState(() =>
        editRule
            ? {
                title: editRule.title,
                amount: editRule.amount,
                type: editRule.type,
                category: editRule.category,
                paymentMethod: editRule.paymentMethod,
                frequency: editRule.frequency,
                interval: editRule.interval,
                startDate: editRule.startDate?.slice(0, 10),
                endDate: editRule.endDate?.slice(0, 10) || "",
            }
            : {
                title: "",
                amount: "",
                type: "expense",
                category: "",
                paymentMethod: "other",
                frequency: "monthly",
                interval: 1,
                startDate: "",
                endDate: "",
            }
    );

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, amount, category, startDate } = formData;

        if (!title || !amount || !category || !startDate) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            if (editRule) {
                // ✅ UPDATE existing recurring rule
                await axios.put(
                    `${API_BASE_URL}/api/recurring/${editRule._id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.success("Recurring transaction updated");
            } else {
                // ✅ CREATE new recurring rule
                await axios.post(`${API_BASE_URL}/api/recurring`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("Recurring transaction created");
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save recurring transaction");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-xl p-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {editRule ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <input
                        name="title"
                        placeholder="Title (e.g. Monthly Rent)"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full input"
                    />

                    {/* Amount */}
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full input"
                    />

                    {/* Type & Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <select name="type" value={formData.type} onChange={handleChange} className="input">
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>

                        <input
                            name="category"
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    {/* Frequency & Interval */}
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="input"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        <input
                            type="number"
                            min="1"
                            name="interval"
                            placeholder="Interval"
                            value={formData.interval}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="input"
                        />
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            {editRule ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecurringModal;
