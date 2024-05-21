import type { CSSProperties } from "react";

export const jsToCss = (js: CSSProperties) => {
    let cssString = "";

    for (const [key, value] of Object.entries(js)) {
        cssString += key.replace(/([A-Z])/g, (g) => `-${g[0]?.toLowerCase()}`) + ": " + value + ";\n";
    }

    return cssString;
};
