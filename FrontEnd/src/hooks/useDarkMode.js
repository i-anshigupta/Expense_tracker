// client/src/hooks/useDarkMode.js
import { useEffect, useState } from "react";

/**
 * useDarkMode hook
 * - reads preference from localStorage ('theme' = 'dark'|'light'|'system')
 * - applies `dark` class to document.documentElement
 * - returns [theme, setTheme] where theme is 'dark' or 'light'
 */

const THEME_KEY = "theme_preference"; // localStorage key

export default function useDarkMode() {
    const [theme, setThemeState] = useState(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved) {
                return saved === "dark" ? "dark" : "light";
            }
            // default: follow system preference
            if (typeof window !== "undefined" && window.matchMedia) {
                return window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light";
            }
            return "light";
        } catch {
            return "light";
        }
    });

    useEffect(() => {
        try {
            // persist
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            // ignore
        }

        // apply to html element
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    // setter that accepts 'dark'|'light'
    const setTheme = (value) => {
        if (value !== "dark" && value !== "light") return;
        setThemeState(value);
    };

    return [theme, setTheme];
}
