import type { CSSProperties } from "react";

function toKebabCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export const jsToCss = (js: CSSProperties): string => {
    let cssString = "";

    for (const [key, value] of Object.entries(js)) {
        if (typeof value !== "string" && typeof value !== "number") {
            continue;
        }

        cssString += `${toKebabCase(key)}: ${value};\n`;
    }

    return cssString;
};
