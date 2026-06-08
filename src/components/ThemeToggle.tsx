import { useTheme } from "../providers/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="rounded text-text-weak cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out hover:text-primary "
        >
            {theme === "light" ? <Moon /> : <Sun />}
        </button>
    );
}