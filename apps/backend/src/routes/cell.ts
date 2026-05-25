import type { Cell, CellCss, CellEditResponse, Spreadsheet, ViewCellResponse } from "@sheet-stream/shared";
import { isBefore } from "date-fns/isBefore";
import { subSeconds } from "date-fns/subSeconds";
import { Hono } from "hono";
import { getKnex } from "../db/getKnex.ts";
import { jsToCss } from "../services/jsToCss.ts";
import { refreshSpreadsheet } from "../services/refreshSpreadsheet.ts";

export const cellRoutes = new Hono();

const defaultCss: CellCss = {
    color: "white",
    fontFamily: "Pixelify Sans",
    fontSize: "48px",
    fontWeight: "700",
    fontStyle: "normal",
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Data for the frontend edit page; replaces the server-side data fetch the
// Next.js /edit/[id] page used to do directly against the database.
cellRoutes.get("/api/cell/:id/edit", async (c) => {
    const id = c.req.param("id");
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (cell === undefined) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    const spreadsheet = await knex<Spreadsheet>("spreadsheets").where({ id: cell.spreadsheet_id }).first();

    if (spreadsheet === undefined) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    return c.json({ cell, spreadsheetName: spreadsheet.name } satisfies CellEditResponse);
});

cellRoutes.get("/api/cell/:id", async (c) => {
    const id = c.req.param("id");
    const knex = getKnex();

    let cell = await knex<Cell>("cells").where({ id }).first();

    if (cell === undefined) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    const refreshThreshold = subSeconds(new Date(), 5);

    if (cell.last_refreshed_at === null || isBefore(cell.last_refreshed_at, refreshThreshold)) {
        const spreadsheet = await knex<Spreadsheet>("spreadsheets").where({ id: cell.spreadsheet_id }).first();

        if (spreadsheet === undefined) {
            return c.text("Not found. That link's no good, get rid of it.", 404);
        }

        await refreshSpreadsheet(spreadsheet, [cell]);

        const refreshed = await knex<Cell>("cells").where({ id }).first();
        if (refreshed !== undefined) {
            cell = refreshed;
        }
    }

    // Update the last accessed time.
    await knex<Cell>("cells").where({ id }).update({ last_accessed_at: new Date() });

    let value = cell.value;
    const css = cell.css ?? defaultCss;

    const accept = c.req.header("accept");
    const acceptsJson: boolean = accept?.includes("application/json") ?? false;
    if (acceptsJson) {
        return c.json({ value, css } satisfies ViewCellResponse);
    }

    if (value === null || value === "") {
        value = "N/A";
    }

    const fontFamily = encodeURIComponent(css.fontFamily ?? "Pixelify Sans");
    const fontWeight = encodeURIComponent(css.fontWeight ?? "700");

    // Only `value` originates from Google Sheets and needs HTML escaping. The CSS
    // comes from a zod-validated edit form set by the same user viewing the page,
    // and escaping it would mangle the inline style attribute.
    const html = `<head><meta http-equiv="refresh" content="1"><link href="https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&display=swap" rel="stylesheet"></head><div style="${jsToCss(css)}">${escapeHtml(value)}</div>`;

    return c.html(html);
});
