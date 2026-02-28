import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Plus,
    Calendar,
    Wallet,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const BudgetsPage = () => {
    const { token } = useSelector((state) => state.auth);

    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const [formData, setFormData] = useState({
        category: "",
        limit: "",
    });

    const categories = [
        "Food",
        "Rent",
        "Bills",
        "Travel",
        "Shopping",
        "Entertainment",
        "Groceries",
        "Health",
        "Other",
    ];

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API_BASE_URL}/api/budgets?month=${month}&year=${year}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setBudgets(res.data.data.budgets || []);
        } catch (err) {
            console.error("Fetch budgets error:", err);
            toast.error("Failed to load budgets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchBudgets();
    }, [token, month, year]); // reload when selecting month/year

    const openAddForm = () => {
        setIsFormOpen(true);
        setIsEditMode(false);
        setFormData({ category: "", limit: "" });
    };

    const openEditForm = (budget) => {
        setIsFormOpen(true);
        setIsEditMode(true);
        setEditingBudget(budget);
        setFormData({
            category: budget.category,
            limit: budget.limit,
        });
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingBudget(null);
        setIsEditMode(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "limit" ? value.replace(/[^\d]/g, "") : value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { category, limit } = formData;

        if (!category || !limit) {
            toast.error("Please fill all fields");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (isEditMode) {
                await axios.put(
                    `${API_BASE_URL}/api/budgets/${editingBudget._id}`,
                    { limit: Number(limit) },
                    { headers }
                );
                toast.success("Budget updated");
            } else {
                await axios.post(
                    `${API_BASE_URL}/api/budgets`,
                    {
                        category,
                        limit: Number(limit),
                        month,
                        year,
                    },
                    { headers }
                );
                toast.success("Budget added");
            }

            closeForm();
            fetchBudgets();
        } catch (err) {
            console.error("Save budget error:", err);
            toast.error(err.response?.data?.message || "Failed to save budget");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this budget?"))
            return;

        try {
            await axios.delete(`${API_BASE_URL}/api/budgets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Budget deleted");
            fetchBudgets();
        } catch (err) {
            console.error("Delete budget error:", err);
            toast.error("Failed to delete budget");
        }
    };

    const formatCurrency = (v) =>
        Number(v || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
        });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800 flex items-center gap-2">
                        <Wallet className="text-emerald-600 dark:text-emerald-400" />
                        Budgets
                    </h1>
                    <p className="text-sm text-slate-800 dark:text-slate-800">
                        Plan your monthly spending and track usage.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition text-sm font-medium"
                >
                    <Plus size={18} />
                    Add Budget
                </button>
            </div>

            {/* Month Selector */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-600 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar size={20} />
                    <p className="text-sm font-medium">Select Month</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>
                                {m}
                            </option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option>{currentDate.getFullYear()}</option>
                        <option>{currentDate.getFullYear() - 1}</option>
                        <option>{currentDate.getFullYear() - 2}</option>
                    </select>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    <p className="text-slate-500 dark:text-slate-400">Loading budgets...</p>
                ) : budgets.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400">No budgets set for this month.</p>
                ) : (
                    budgets.map((b) => {
                        const percent = b.percentUsed;
                        const color =
                            percent < 70
                                ? "bg-emerald-500 dark:bg-emerald-600"
                                : percent < 100
                                    ? "bg-amber-500 dark:bg-amber-600"
                                    : "bg-red-500 dark:bg-red-600";

                        return (
                            <div
                                key={b._id}
                                className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-600 shadow-sm rounded-2xl p-4 space-y-3"
                            >
                                {/* Category & Actions */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        {b.category}
                                    </h2>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditForm(b)}
                                            className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b._id)}
                                            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Limit */}
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Limit:{" "}
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                                        {formatCurrency(b.limit)}
                                    </span>
                                </p>

                                {/* Spent */}
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Spent:{" "}
                                    <span
                                        className={`font-semibold ${b.isExceeded
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-slate-800 dark:text-slate-100"
                                            }`}
                                    >
                                        {formatCurrency(b.spent)}
                                    </span>
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`${color} h-3 rounded-full transition-all duration-300`}
                                        style={{ width: `${Math.min(percent, 100)}%` }}
                                    ></div>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {percent.toFixed(1)}% used
                                    {b.isExceeded && (
                                        <span className="text-red-600 dark:text-red-400 font-medium ml-1">
                                            (Exceeded!)
                                        </span>
                                    )}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-40">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-5 relative">
                        {/* Close button */}
                        <button
                            onClick={closeForm}
                            className="absolute top-3 right-3 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            {isEditMode ? "Edit Budget" : "Add Budget"}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            {isEditMode
                                ? "Update the budget limit for this category."
                                : "Create a spending limit for a category this month."}
                        </p>

                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            {/* Category */}
                            {!isEditMode && (
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Select</option>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Limit */}
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Limit (₹)
                                </label>
                                <input
                                    type="text"
                                    name="limit"
                                    value={formData.limit}
                                    onChange={handleFormChange}
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Enter limit"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                                >
                                    {isEditMode ? "Save Changes" : "Add Budget"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsPage;