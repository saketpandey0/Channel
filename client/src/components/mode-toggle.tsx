import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";

type Theme = "light" | "dark" | "system";

export const ModeToggle = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Initialize from localStorage or default to system
        const savedTheme = localStorage.getItem("theme") as Theme;
        return savedTheme || "system";
    });

    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

    // Track system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemTheme(mediaQuery.matches ? "dark" : "light");

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");

        let effectiveTheme: "light" | "dark";

        if (theme === "system") {
            effectiveTheme = systemTheme;
        } else {
            effectiveTheme = theme;
        }

        root.classList.add(effectiveTheme);
    }, [theme, systemTheme]);

    const toggleTheme = () => {
        const themeOrder: Theme[] = ["light", "dark", "system"];
        const currentIndex = themeOrder.indexOf(theme);
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        
        setTheme(nextTheme);
        
        if (nextTheme === "system") {
            localStorage.removeItem("theme");
        } else {
            localStorage.setItem("theme", nextTheme);
        }
    };

    // Determine which icon to show based on effective theme
    const getEffectiveTheme = () => {
        if (theme === "system") {
            return systemTheme;
        }
        return theme;
    };

    const effectiveTheme = getEffectiveTheme();
    const isDark = effectiveTheme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="relative size-8 flex items-center justify-center border border-neutral-200 dark:border-neutral-800 p-2 rounded-md  transition-colors"
            aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
            title={`Current: ${theme} theme`}
        >
            <MoonIcon 
                className={`absolute size-4 transition-all duration-300 ${
                    isDark 
                        ? "scale-100 rotate-0 opacity-100" 
                        : "scale-0 rotate-90 opacity-0"
                }`}
            />
            <SunIcon 
                className={`absolute size-4 transition-all duration-300 ${
                    !isDark 
                        ? "scale-100 rotate-0 opacity-100" 
                        : "scale-0 rotate-90 opacity-0"
                }`}
            />
        </button>
    );
};