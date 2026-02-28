import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
    BarChart3,
    CalendarRange,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
} from "lucide-react";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AnalyticsPage = () => {
    const { token } = useSelector((state) => state.auth);

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
    });
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [monthCompare, setMonthCompare] = useState({
        currentMonth: { income: 0, expense: 0, savings: 0 },
        previousMonth: { income: 0, expense: 0, savings: 0 },
    });

    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
    });

    // Detect dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            const darkMode = document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(darkMode);
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const [summaryRes, categoryRes, trendRes, monthCompRes] =
                await Promise.all([
                    axios.get(`${API_BASE_URL}/api/analytics/summary`, {
                        headers,
                        params,
                    }),
                    axios.get(`${API_BASE_URL}/api/analytics/by-category`, {
                        headers,
                        params,
                    }),
                    axios.get(`${API_BASE_URL}/api/analytics/trend`, {
                        headers,
                        params,
                    }),
                    axios.get(`${API_BASE_URL}/api/analytics/month-compare`, {
                        headers,
                    }),
                ]);

            setSummary(summaryRes.data.data || {});
            setCategoryData(categoryRes.data.data.categories || []);
            setTrendData(trendRes.data.data.trend || []);
            setMonthCompare(monthCompRes.data.data || {});
        } catch (error) {
            console.error("Analytics page error:", error);
            toast.error("Failed to load analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const applyFilters = () => {
        fetchAnalytics();
    };

    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
        });
        fetchAnalytics();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Doughnut chart data (category-wise)
    const doughnutData = {
        labels: categoryData.map((c) => c.category),
        datasets: [
            {
                data: categoryData.map((c) => c.total),
                backgroundColor: [
                    "#22c55e",
                    "#3b82f6",
                    "#f97316",
                    "#ec4899",
                    "#a855f7",
                    "#0ea5e9",
                    "#facc15",
                    "#ef4444",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Trend line chart data with theme-aware colors
    const lineData = {
        labels: trendData.map(
            (item) => `${item.month}/${item.year.toString().slice(-2)}`
        ),
        datasets: [
            {
                label: "Income",
                data: trendData.map((item) => item.income),
                borderColor: isDarkMode ? "#4ade80" : "#16a34a",
                backgroundColor: isDarkMode ? "rgba(74, 222, 128, 0.1)" : "rgba(22, 163, 74, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: isDarkMode ? "#4ade80" : "#16a34a",
                pointBorderColor: isDarkMode ? "#1f2937" : "#ffffff",
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
            {
                label: "Expense",
                data: trendData.map((item) => item.expense),
                borderColor: isDarkMode ? "#f87171" : "#dc2626",
                backgroundColor: isDarkMode ? "rgba(248, 113, 113, 0.1)" : "rgba(220, 38, 38, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: isDarkMode ? "#f87171" : "#dc2626",
                pointBorderColor: isDarkMode ? "#1f2937" : "#ffffff",
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    // Enhanced chart options
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: isDarkMode ? "#e5e7eb" : "#1e293b",
                    font: {
                        size: 12,
                        weight: 500,
                    },
                    padding: 15,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                titleColor: isDarkMode ? "#f3f4f6" : "#1e293b",
                bodyColor: isDarkMode ? "#e5e7eb" : "#475569",
                borderColor: isDarkMode ? "#374151" : "#e2e8f0",
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += formatCurrency(context.parsed.y);
                        return label;
                    }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? "#374151" : "#e2e8f0",
                    drawBorder: false,
                },
                ticks: {
                    color: isDarkMode ? "#9ca3af" : "#64748b",
                    font: {
                        size: 11,
                    },
                    callback: function (value) {
                        return '₹' + (value / 1000).toFixed(0) + 'k';
                    }
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDarkMode ? "#9ca3af" : "#64748b",
                    font: {
                        size: 11,
                    },
                },
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const doughnutChartOptions = {
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: isDarkMode ? "#e5e7eb" : "#1e293b",
                },
            },
        },
        maintainAspectRatio: false,
    };

    const current = monthCompare.currentMonth || {
        income: 0,
        expense: 0,
        savings: 0,
    };
    const previous = monthCompare.previousMonth || {
        income: 0,
        expense: 0,
        savings: 0,
    };

    const diff = (curr, prev) =>
        prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    const incomeChange = diff(current.income, previous.income);
    const expenseChange = diff(current.expense, previous.expense);
    const savingsChange = diff(current.savings, previous.savings);

    const formatPercent = (value) =>
        `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800 flex items-center gap-2">
                        <BarChart3 className="text-emerald-600 dark:text-emerald-400" />
                        Analytics
                    </h1>
                    <p className="text-sm text-slate-800 dark:text-slate-800">
                        Deep insights into your income, expenses, and savings.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-600 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <CalendarRange size={18} className="text-slate-500 dark:text-slate-400" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Date range (optional)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                    {/* Buttons */}
                    <div className="flex items-end gap-2">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-700 transition w-full"
                        >
                            Reset
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 text-sm bg-slate-800 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition w-full"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary cards (income / expense / savings) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Income */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-emerald-50 dark:border-emerald-500/40 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <ArrowDownRight className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Total Income
                        </p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.totalIncome)}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                            <ArrowUpRight size={14} />
                            {formatPercent(incomeChange)} vs last month
                        </p>
                    </div>
                </div>

                {/* Expense */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-rose-50 dark:border-rose-500/40 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <ArrowUpRight className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Total Expense
                        </p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.totalExpense)}
                        </p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                            <ArrowUpRight size={14} />
                            {formatPercent(expenseChange)} vs last month
                        </p>
                    </div>
                </div>

                {/* Savings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-2 border-sky-50 dark:border-sky-500/40 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <Wallet className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Net Savings
                        </p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.savings)}
                        </p>
                        <p
                            className={`text-xs mt-1 flex items-center gap-1 ${savingsChange >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                                }`}
                        >
                            <ArrowUpRight size={14} />
                            {formatPercent(savingsChange)} vs last month
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-600 p-4 md:p-5">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        Expenses by Category
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Discover which categories consume most of your budget.
                    </p>

                    {isLoading ? (
                        <div className="h-56 flex items-center justify-center text-slate-400 dark:text-slate-300 text-sm">
                            Loading chart...
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className="h-56 flex flex-col items-center justify-center text-slate-400 dark:text-slate-300 text-sm">
                            <p>No expense data found for this range.</p>
                            <p>Add some expenses or change the date range.</p>
                        </div>
                    ) : (
                        <div className="h-60">
                            <Doughnut
                                data={doughnutData}
                                options={doughnutChartOptions}
                            />
                        </div>
                    )}
                </div>

                {/* Trend Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-slate-100 dark:border-slate-600 p-4 md:p-5">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        Income vs Expense Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Track how your finances evolve over time.
                    </p>

                    {isLoading ? (
                        <div className="h-56 flex items-center justify-center text-slate-400 dark:text-slate-300 text-sm">
                            Loading chart...
                        </div>
                    ) : trendData.length === 0 ? (
                        <div className="h-56 flex flex-col items-center justify-center text-slate-400 dark:text-slate-300 text-sm">
                            <p>Not enough data to show trend.</p>
                            <p>Add transactions across multiple months.</p>
                        </div>
                    ) : (
                        <div className="h-60">
                            <Line
                                data={lineData}
                                options={lineChartOptions}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;