// client/src/components/DarkModeToggle.jsx
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const DarkModeToggle = ({ theme, setTheme }) => {
    const isDark = theme === "dark";

    const toggle = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <motion.button
            onClick={toggle}
            aria-label="Toggle dark mode"
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>
    );
};

export default DarkModeToggle;
