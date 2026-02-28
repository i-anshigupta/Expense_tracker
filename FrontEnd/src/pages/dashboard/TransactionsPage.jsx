import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Filter, X, Pencil, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Basic categories for now (later we can fetch from backend)
const DEFAULT_CATEGORIES = [
    "Food",
    "Rent",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Salary",
    "Other",
];

const TransactionsPage = () => {
    const { token } = useSelector((state) => state.auth);

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        type: "",
        category: "",
        startDate: "",
        endDate: "",
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        category: "",
        date: "",
        description: "",
        paymentMethod: "other",
    });

    // Helpers
    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const params = {};

            if (filters.type) params.type = filters.type;
            if (filters.category) params.category = filters.category;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const res = await axios.get(`${API_BASE_URL}/api/transactions`, {
                headers,
                params,
            });

            setTransactions(res.data.data.transactions || []);
        } catch (error) {
            console.error("Fetch transactions error:", error);
            toast.error("Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        fetchTransactions();
    };

    const resetFilters = () => {
        setFilters({
            type: "",
            category: "",
            startDate: "",
            endDate: "",
        });
        fetchTransactions();
    };

    const openNewForm = () => {
        setEditingTransaction(null);
        setFormData({
            amount: "",
            type: "expense",
            category: "",
            date: "",
            description: "",
            paymentMethod: "other",
        });
        setIsFormOpen(true);
    };

    const openEditForm = (tx) => {
        setEditingTransaction(tx);
        setFormData({
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            date: tx.date?.slice(0, 10), // YYYY-MM-DD for input
            description: tx.description || "",
            paymentMethod: tx.paymentMethod || "other",
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingTransaction(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "amount" ? value.replace(/[^\d.]/g, "") : value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const { amount, type, category, date } = formData;

        if (!amount || !type || !category || !date) {
            toast.error("Please fill in amount, type, category and date");
            return;
        }

        const payload = {
            ...formData,
            amount: Number(amount),
        };

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        try {
            if (editingTransaction) {
                // Update
                await axios.put(
                    `${API_BASE_URL}/api/transactions/${editingTransaction._id}`,
                    payload,
                    { headers }
                );
                toast.success("Transaction updated");
            } else {
                // Create
                await axios.post(`${API_BASE_URL}/api/transactions`, payload, {
                    headers,
                });
                toast.success("Transaction added");
            }

            closeForm();
            fetchTransactions();
        } catch (error) {
            console.error("Save transaction error:", error);
            toast.error("Failed to save transaction");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) {
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        };

        try {
            await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, { headers });
            toast.success("Transaction deleted");
            fetchTransactions();
        } catch (error) {
            console.error("Delete transaction error:", error);
            toast.error("Failed to delete transaction");
        }
    };

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800">
                        Transactions
                    </h1>
                    <p className="text-sm text-slate-800 dark:text-slate-800">
                        View, add and manage all your income and expenses.
                    </p>
                </div>

                <button
                    onClick={openNewForm}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
                >
                    <Plus size={18} />
                    Add Transaction
                </button>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-emerald-50 dark:border-emerald-500/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Income
                    </p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalIncome)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-rose-50 dark:border-rose-500/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Expense
                    </p>
                    <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(totalExpense)}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-sky-50 dark:border-sky-500/40">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Balance
                    </p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-slate-100 dark:border-slate-600 space-y-3">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-500 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Filters</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Type */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All</option>
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap gap-2 justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-700 transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 text-sm bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-600 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                <th className="text-left px-4 py-2 font-medium">Date</th>
                                <th className="text-left px-4 py-2 font-medium">Type</th>
                                <th className="text-left px-4 py-2 font-medium">Category</th>
                                <th className="text-right px-4 py-2 font-medium">Amount</th>
                                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">
                                    Description
                                </th>
                                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">
                                    Method
                                </th>
                                <th className="text-right px-4 py-2 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400 dark:text-slate-300 text-sm">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400 dark:text-slate-300 text-sm">
                                        No transactions found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr
                                        key={tx._id}
                                        className="border-t border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        {/* Date */}
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {formatDate(tx.date)}
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-2">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                                        ${tx.type === "income"
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                                    }`}
                                            >
                                                {tx.type === "income" ? "Income" : "Expense"}
                                            </span>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {tx.category}
                                                </span>

                                                {tx.isRecurring && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full
                                                                bg-indigo-100 text-indigo-700
                                                                dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        Recurring
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-2 text-right font-medium">
                                            {formatCurrency(tx.amount)}
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-2 hidden md:table-cell max-w-xs truncate">
                                            {tx.description || "-"}
                                        </td>

                                        {/* Method */}
                                        <td className="px-4 py-2 hidden md:table-cell">
                                            {tx.paymentMethod || "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditForm(tx)}
                                                    className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx._id)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Add/Edit Transaction Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-40">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-5 relative">
                        <button
                            onClick={closeForm}
                            className="absolute top-3 right-3 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            {editingTransaction
                                ? "Update the details of your transaction."
                                : "Fill in the details to add a new transaction."}
                        </p>

                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            {/* Amount */}
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Amount
                                </label>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleFormChange}
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Enter amount"
                                />
                            </div>

                            {/* Type & Category */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleFormChange}
                                        className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
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
                                        {DEFAULT_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleFormChange}
                                        className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleFormChange}
                                        className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    Description (optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    rows={2}
                                    className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Add a note about this transaction"
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
                                    {editingTransaction ? "Save Changes" : "Add Transaction"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;