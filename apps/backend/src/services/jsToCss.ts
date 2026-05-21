import type { CSSProperties } from "react";

function toKebabCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export const jsToCss = (js: CSSProperties): string => {
    let cssString = "";

    for (const [key, value] of Object.entries(js) as [string, string | number | undefined][]) {
        if (value === undefined) {
            continue;
        }

        cssString += `${toKebabCase(key)}: ${String(value)};\n`;
    }

    return cssString;
};
