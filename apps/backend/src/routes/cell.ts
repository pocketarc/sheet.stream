import { Hono } from "hono";
import type { CSSProperties } from "react";
import { subSeconds } from "date-fns/subSeconds";
import { isBefore } from "date-fns/isBefore";
import type { Cell, CellEditResponse, Spreadsheet, ViewCellResponse } from "@sheet-stream/shared";
import getKnex from "../db/getKnex";
import { jsToCss } from "../services/jsToCss";
import { refreshSpreadsheet } from "../services/refreshSpreadsheet";

export const cellRoutes = new Hono();

const defaultCss: CSSProperties = {
    color: "white",
    fontFamily: "Pixelify Sans",
    fontSize: "48px",
    fontWeight: "700",
    fontStyle: "normal",
};

// Data for the frontend edit page; replaces the server-side data fetch the
// Next.js /edit/[id] page used to do directly against the database.
cellRoutes.get("/api/cell/:id/edit", async (c) => {
    const id = c.req.param("id");
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (!cell) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    const spreadsheet = await knex<Spreadsheet>("spreadsheets").where({ id: cell.spreadsheet_id }).first();

    if (!spreadsheet) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    return c.json({ cell, spreadsheetName: spreadsheet.name } satisfies CellEditResponse);
});

cellRoutes.get("/api/cell/:id", async (c) => {
    const id = c.req.param("id");
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (!cell) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    const refreshThreshold = subSeconds(new Date(), 5);

    if (!cell.last_refreshed_at || isBefore(cell.last_refreshed_at, refreshThreshold)) {
        const spreadsheet = await knex<Spreadsheet>("spreadsheets").where({ id: cell.spreadsheet_id }).first();

        if (!spreadsheet) {
            return c.text("Not found. That link's no good, get rid of it.", 404);
        }

        await refreshSpreadsheet(spreadsheet, [cell]);
    }

    // Update the last accessed time.
    await knex<Cell>("cells").where({ id }).update({ last_accessed_at: new Date() });

    let value = cell.value;
    const css = cell.css ?? defaultCss;

    const accept = c.req.header("accept");
    if (accept && accept.includes("application/json")) {
        return c.json({ value, css } satisfies ViewCellResponse);
    }

    if (!value) {
        value = "N/A";
    }

    const fontFamily = encodeURIComponent(css.fontFamily ?? "Pixelify Sans");
    const fontWeight = encodeURIComponent(css.fontWeight ?? "700");

    const html = `<head><meta http-equiv="refresh" content="1"><link href="https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&display=swap" rel="stylesheet"></head><div style="${jsToCss(css)}">${value}</div>`;

    return c.html(html);
});
