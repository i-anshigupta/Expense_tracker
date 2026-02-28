import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
    ArrowDownCircle,
    ArrowUpCircle,
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

const DashboardPage = () => {
    const { token } = useSelector((state) => state.auth);

    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        savings: 0,
    });
    const [categoryData, setCategoryData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Detect dark mode - adjust this based on your theme implementation
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check if dark mode is enabled
        const checkDarkMode = () => {
            const darkMode = document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(darkMode);
        };

        checkDarkMode();

        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [summaryRes, categoryRes, trendRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/analytics/summary`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/by-category`, { headers }),
                axios.get(`${API_BASE_URL}/api/analytics/trend`, { headers }),
            ]);

            setSummary(summaryRes.data.data);
            setCategoryData(categoryRes.data.data.categories || []);
            setTrendData(trendRes.data.data.trend || []);
        } catch (error) {
            console.error("Dashboard analytics error:", error);
            toast.error("Failed to load analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAnalytics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const formatCurrency = (value) =>
        value?.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });

    // Data for category doughnut chart
    const doughnutData = {
        labels: categoryData.map((c) => c.category),
        datasets: [
            {
                data: categoryData.map((c) => c.total),
                backgroundColor: [
                    "#10b981",
                    "#6366f1",
                    "#f97316",
                    "#ec4899",
                    "#22c55e",
                    "#0ea5e9",
                    "#facc15",
                    "#ef4444",
                ],
                borderWidth: 1,
            },
        ],
    };

    // Enhanced line data with theme-aware colors
    const lineData = {
        labels: trendData.map(
            (item) => `${item.month}/${item.year.toString().slice(-2)}`
        ),
        datasets: [
            {
                label: "Income",
                data: trendData.map((item) => item.income),
                borderColor: isDarkMode ? "#4ade80" : "#16a34a", // Brighter green in dark mode, darker in light mode
                backgroundColor: isDarkMode ? "rgba(74, 222, 128, 0.1)" : "rgba(22, 163, 74, 0.1)",
                borderWidth: 3, // Thicker line
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
                borderColor: isDarkMode ? "#f87171" : "#dc2626", // Brighter red in dark mode, darker in light mode
                backgroundColor: isDarkMode ? "rgba(248, 113, 113, 0.1)" : "rgba(220, 38, 38, 0.1)",
                borderWidth: 3, // Thicker line
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: isDarkMode ? "#f87171" : "#dc2626",
                pointBorderColor: isDarkMode ? "#1f2937" : "#ffffff",
                pointBorderWidth: 2,
                pointHoverRadius: 6,
            },
        ],
    };

    // Enhanced chart options with theme-aware styling
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-800">
                    Overview
                </h1>
                <p className="text-sm text-slate-800 dark:text-slate-800">
                    A quick summary of your income, expenses & savings.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {/* Income */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 md:p-5 flex items-center gap-4 border-2 border-emerald-50 dark:border-emerald-500/40">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <ArrowDownCircle className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Total Income
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.totalIncome)}
                        </p>
                    </div>
                </div>

                {/* Expense */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 md:p-5 flex items-center gap-4 border-2 border-rose-50 dark:border-rose-500/40">
                    <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <ArrowUpCircle className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Total Expense
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.totalExpense)}
                        </p>
                    </div>
                </div>

                {/* Savings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 md:p-5 flex items-center gap-4 border-2 border-sky-50 dark:border-sky-500/40">
                    <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <Wallet className="text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Net Savings
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(summary.savings)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 md:p-5 border-2 border-slate-100 dark:border-slate-600">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        Expenses by Category
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        See where most of your money is going.
                    </p>

                    {isLoading ? (
                        <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
                            Loading chart...
                        </div>
                    ) : categoryData.length === 0 ? (
                        <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm">
                            <p>No expense data yet.</p>
                            <p>Add some transactions to see insights.</p>
                        </div>
                    ) : (
                        <div className="h-60">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: "bottom",
                                            labels: {
                                                color: isDarkMode ? "#e5e7eb" : "#1e293b",
                                            },
                                        },
                                    },
                                    maintainAspectRatio: false,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 md:p-5 border-2 border-slate-100 dark:border-slate-600">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        Income vs Expense Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Track how your finances change month over month.
                    </p>

                    {isLoading ? (
                        <div className="h-52 flex items-center justify-center text-slate-400 text-sm">
                            Loading chart...
                        </div>
                    ) : trendData.length === 0 ? (
                        <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm">
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

export default DashboardPage;