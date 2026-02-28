import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 transition-colors duration-300">
            {/* Auth Card */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-white/20 dark:border-slate-700 p-8 backdrop-blur-sm">
                {/* App Branding */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                        Smart Expense Tracker
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Track • Analyze • Save smarter
                    </p>
                </div>

                {/* Render Login / Register pages */}
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;