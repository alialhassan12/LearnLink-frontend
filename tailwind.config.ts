import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                text: "var(--text)",
                primary: "var(--primary)",
            },
        },
    },
    plugins: [],
};

export default config;