import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    darkMode: ["class"],
    content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
    prefix: "",
    theme: {
        extend: {
            colors: {
                haze: {
                    "50": "hsl(265, 12.30%, 97.49%)",
                    "100": "hsl(265, 12.30%, 92.32%)",
                    "200": "hsl(265, 12.30%, 86.07%)",
                    "300": "hsl(265, 12.30%, 74.90%)",
                    "400": "hsl(265, 12.30%, 69.26%)",
                    "500": "hsl(265, 12.30%, 63.73%)",
                    DEFAULT: "hsl(265, 12.30%, 63.73%)",
                    "600": "hsl(265, 12.30%, 43.33%)",
                    "700": "hsl(265, 12.30%, 36.71%)",
                    "800": "hsl(265, 12.30%, 30.41%)",
                    "900": "hsl(265, 12.30%, 19.22%)",
                    "1000": "hsl(265, 12.30%, 12.93%)",
                    "1100": "hsl(265, 12.30%, 6.72%)",
                },
                blue: {
                    "50": "hsl(255, 68.60%, 98.09%)",
                    "100": "hsl(255, 68.60%, 94.67%)",
                    "200": "hsl(255, 68.60%, 90.01%)",
                    "300": "hsl(255, 68.60%, 81.85%)",
                    "400": "hsl(255, 68.60%, 77.63%)",
                    "500": "hsl(255, 68.60%, 73.48%)",
                    "600": "hsl(255, 68.60%, 57.66%)",
                    "700": "hsl(255, 68.60%, 51.80%)",
                    "800": "hsl(255, 68.60%, 43.69%)",
                    "900": "hsl(255, 68.60%, 28.64%)",
                    "1000": "hsl(255, 68.60%, 19.80%)",
                    "1100": "hsl(255, 68.60%, 11.23%)",
                    DEFAULT: "hsl(255, 68.60%, 11.23%)",
                },
                purple: {
                    "50": "hsl(274, 48.50%, 97.88%)",
                    "100": "hsl(274, 48.50%, 93.68%)",
                    "200": "hsl(274, 48.50%, 88.13%)",
                    "300": "hsl(274, 48.50%, 78.90%)",
                    "400": "hsl(274, 48.50%, 73.90%)",
                    "500": "hsl(274, 48.50%, 69.06%)",
                    "600": "hsl(274, 48.50%, 50.58%)",
                    "700": "hsl(274, 48.50%, 43.17%)",
                    "800": "hsl(274, 48.50%, 35.72%)",
                    "900": "hsl(274, 48.50%, 22.80%)",
                    "1000": "hsl(274, 48.50%, 15.35%)",
                    DEFAULT: "hsl(274, 48.50%, 15.35%)",
                    "1100": "hsl(274, 48.50%, 8.43%)",
                },
            },
            fontSize: {
                "6xl": "3.5rem",
                "7xl": "4rem",
            },
            textShadow: {
                sm: "1px 1px 0px var(--tw-shadow-color)",
                DEFAULT: "2px 2px 0px var(--tw-shadow-color)",
                lg: "4px 4px 0px var(--tw-shadow-color)",
            },
            fontFamily: {
                title: ["var(--font-title)"],
                body: [
                    '-apple-system, BlinkMacSystemFont, "avenir next", avenir, "segoe ui", "helvetica neue", helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif',
                ],
            },
            animation: {
                "spin-slow": "spin 5s linear infinite",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities(
                {
                    "text-shadow": (value) => ({
                        textShadow: value,
                    }),
                },
                // @ts-expect-error - This seems to be a bug in the tailwindcss types.
                { values: theme("textShadow") },
            );
        }),
    ],
};
export default config;
