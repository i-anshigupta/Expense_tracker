import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus, Pause, Play, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import AddRecurringModal from "../../components/recurring/AddRecurringModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getNextRunDate = (rule) => {
    if (rule.status !== "active") return "Paused";

    const baseDate = rule.lastExecutedAt
        ? new Date(rule.lastExecutedAt)
        : new Date(rule.startDate);

    const nextDate = new Date(baseDate);

    const interval = rule.interval || 1;

    switch (rule.frequency) {
        case "daily":
            nextDate.setDate(nextDate.getDate() + interval);
            break;
        case "weekly":
            nextDate.setDate(nextDate.getDate() + 7 * interval);
            break;
        case "monthly":
            nextDate.setMonth(nextDate.getMonth() + interval);
            break;
        case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            break;
        default:
            return "-";
    }

    return nextDate.toLocaleDateString();
};


const RecurringPage = () => {
    const { token } = useSelector((state) => state.auth);
    const [recurring, setRecurring] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingRule, setEditingRule] = useState(null);

    const fetchRecurring = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/recurring`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecurring(res.data.data);
        } catch {
            toast.error("Failed to load recurring transactions");
        }
    };

    useEffect(() => {
        fetchRecurring();
    }, []);

    const toggleStatus = async (id, status) => {
        try {
            await axios.patch(
                `${API_BASE_URL}/api/recurring/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRecurring();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const deleteRule = async (id) => {
        if (!confirm("Delete this recurring rule?")) return;
        await axios.delete(`${API_BASE_URL}/api/recurring/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchRecurring();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800">
                        Recurring Transactions
                    </h1>
                    <p className="text-sm text-slate-800 dark:text-slate-800 mt-1">
                        Manage your recurring income and expenses
                    </p>
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition font-medium"
                >
                    <Plus size={18} /> Add Recurring
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-600 shadow-sm overflow-hidden">
                {recurring.length === 0 ? (
                    <p className="p-6 text-center text-slate-500 dark:text-slate-400">
                        No recurring rules yet. Add one to get started!
                    </p>
                ) : (
                    recurring.map((r, index) => (
                        <div
                            key={r._id}
                            className={`flex items-center justify-between p-4 ${index !== recurring.length - 1
                                ? 'border-b-2 border-slate-100 dark:border-slate-600'
                                : ''
                                } hover:bg-slate-50 dark:hover:bg-slate-700/50 transition`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                                        {r.title}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        }`}>
                                        {r.status === 'active' ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                    {r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1)} • ₹{r.amount.toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                                    Next run: <span className="font-medium">{getNextRunDate(r)}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Edit Button */}
                                <button
                                    onClick={() => {
                                        setEditingRule(r);
                                        setOpenModal(true);
                                    }}
                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition"
                                    title="Edit"
                                >
                                    <Pencil size={18} />
                                </button>

                                {/* Pause/Resume Button */}
                                {r.status === "active" ? (
                                    <button
                                        onClick={() => toggleStatus(r._id, "paused")}
                                        className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition"
                                        title="Pause"
                                    >
                                        <Pause size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleStatus(r._id, "active")}
                                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition"
                                        title="Resume"
                                    >
                                        <Play size={18} />
                                    </button>
                                )}

                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteRule(r._id)}
                                    className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddRecurringModal
                isOpen={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditingRule(null);
                }}
                onSuccess={fetchRecurring}
                editRule={editingRule}
            />
        </div>
    );

};

export default RecurringPage;