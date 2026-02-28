// client/src/layout/Navbar.jsx
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import useDarkMode from "../hooks/useDarkMode";
import DarkModeToggle from "../components/DarkModeToggle";

const Navbar = ({ onMobileToggle = () => { } }) => {
    const { user } = useSelector((state) => state.auth);

    // color map for avatar background
    const colorMap = {
        emerald: "#10B981",
        sky: "#0EA5E9",
        rose: "#F43F5E",
        amber: "#F59E0B",
        violet: "#8B5CF6",
        slate: "#64748B",
        teal: "#14B8A6",
    };

    const avatarColorHex = colorMap[user?.avatarColor] || colorMap["emerald"];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // use dark mode hook
    const [theme, setTheme] = useDarkMode();

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b dark:border-slate-700 flex items-center px-4 md:px-6">
            {/* Mobile hamburger (animated scale on tap) */}
            <motion.button
                onClick={onMobileToggle}
                className="md:hidden mr-3 text-slate-600 dark:text-slate-200 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Open menu"
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
            >
                <Menu size={22} />
            </motion.button>

            {/* Greeting */}
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {getGreeting()}, {user?.name || "User"} 👋
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                    {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    })}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <DarkModeToggle theme={theme} setTheme={setTheme} />

                <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: avatarColorHex }}
                >
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
