import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    LayoutDashboard,
    List,
    Repeat,
    BarChart3,
    Wallet,
    User,
    LogOut,
    X,
} from "lucide-react";

import { logout } from "../features/auth/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ mobileOpen = false, onClose = () => { } }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${isActive
            ? "bg-emerald-600 text-white"
            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
        }`;

    // framer motion variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const drawerVariants = {
        hidden: { x: "-100%" },
        visible: { x: "0%" },
    };

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="w-64 min-h-screen bg-white border-r hidden md:flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b">
                    <h1 className="text-xl font-bold text-emerald-600">
                        Expense<span className="text-slate-800">Tracker</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    <NavLink to="/" className={linkClasses}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/transactions" className={linkClasses}>
                        <List size={20} />
                        Transactions
                    </NavLink>

                    <NavLink to="/analytics" className={linkClasses}>
                        <BarChart3 size={20} />
                        Analytics
                    </NavLink>

                    <NavLink to="/budgets" className={linkClasses}>
                        <Wallet size={20} />
                        Budgets
                    </NavLink>

                    {/* ✅ NEW: Recurring */}
                    <NavLink to="/recurring" className={linkClasses}>
                        <Repeat size={20} />
                        Recurring
                    </NavLink>

                    <NavLink to="/profile" className={linkClasses}>
                        <User size={20} />
                        Profile
                    </NavLink>
                </nav>

                {/* Logout */}
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile drawer (animated) */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 md:hidden"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={overlayVariants}
                        transition={{ duration: 0.18 }}
                        aria-hidden={!mobileOpen}
                    >
                        {/* Overlay */}
                        <motion.div
                            className="absolute inset-0 bg-black/40"
                            onClick={onClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Drawer */}
                        <motion.aside
                            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={drawerVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="h-16 flex items-center px-4 border-b">
                                <div className="flex-1">
                                    <h1 className="text-lg font-bold text-emerald-600">
                                        ExpenseTracker
                                    </h1>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <nav className="px-3 py-6 space-y-1">
                                <NavLink onClick={onClose} to="/" className={linkClasses}>
                                    <LayoutDashboard size={20} />
                                    Dashboard
                                </NavLink>

                                <NavLink
                                    onClick={onClose}
                                    to="/transactions"
                                    className={linkClasses}
                                >
                                    <List size={20} />
                                    Transactions
                                </NavLink>

                                <NavLink
                                    onClick={onClose}
                                    to="/analytics"
                                    className={linkClasses}
                                >
                                    <BarChart3 size={20} />
                                    Analytics
                                </NavLink>

                                <NavLink
                                    onClick={onClose}
                                    to="/budgets"
                                    className={linkClasses}
                                >
                                    <Wallet size={20} />
                                    Budgets
                                </NavLink>

                                {/* ✅ NEW: Recurring */}
                                <NavLink
                                    onClick={onClose}
                                    to="/recurring"
                                    className={linkClasses}
                                >
                                    <Repeat size={20} />
                                    Recurring
                                </NavLink>

                                <NavLink
                                    onClick={onClose}
                                    to="/profile"
                                    className={linkClasses}
                                >
                                    <User size={20} />
                                    Profile
                                </NavLink>
                            </nav>

                            <div className="p-4 border-t">
                                <button
                                    onClick={() => {
                                        onClose();
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
