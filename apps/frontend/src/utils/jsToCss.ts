import type { CellCss } from "@sheet-stream/shared";

function toKebabCase(key: string): string {
    return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export const jsToCss = (js: CellCss): string => {
    let cssString = "";

    for (const [key, value] of Object.entries(js)) {
        if (typeof value !== "string") {
            continue;
        }

        cssString += `${toKebabCase(key)}: ${value};\n`;
    }

    return cssString;
};
