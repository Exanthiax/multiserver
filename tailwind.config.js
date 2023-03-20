const colors = require("tailwindcss/colors");

module.exports = {
    mode: "jit",
    content: [
        "./src/windows/**/*.{js,jsx,ts,tsx}",
        "./src/components/**/*.{js,jsx,ts,tsx}",
        "./src/index.html",
        "./src/**/*.css",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                sky: colors.sky,
                cyan: colors.cyan,
            },
        },
    },
    variants: {
        extend: {},
    },
    // electron always uses chromium, don't need cross-compatibility
    plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
    variants: {
        scrollbar: ["rounded"],
    },
};
