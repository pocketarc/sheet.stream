import { NextRequest, NextResponse } from "next/server";
import getKnex from "@/utils/getKnex";
import type { Cell, Spreadsheet, ViewCellResponse } from "@/app/types";
import type { CSSProperties } from "react";
import { jsToCss } from "@/utils/jsToCss";
import { refreshSpreadsheet } from "@/utils/refreshSpreadsheet";
import { subSeconds } from "date-fns/subSeconds";
import { isBefore } from "date-fns/isBefore";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (!cell) {
        return new Response("Not found. That link's no good, get rid of it.", { status: 404 });
    }

    const refreshThreshold = subSeconds(new Date(), 5);

    if (!cell.last_refreshed_at || isBefore(cell.last_refreshed_at, refreshThreshold)) {
        const spreadsheet = await knex<Spreadsheet>("spreadsheets").where({ id: cell.spreadsheet_id }).first();

        if (!spreadsheet) {
            return new Response("Not found. That link's no good, get rid of it.", { status: 404 });
        }

        await refreshSpreadsheet(spreadsheet, [cell]);
    }

    // Update the last accessed time.
    await knex<Cell>("cells").where({ id }).update({ last_accessed_at: new Date() });

    let value = cell.value;
    let css = cell.css;

    if (!css) {
        css = {
            color: "white",
            fontFamily: "Pixelify Sans",
            fontSize: "48px",
            fontWeight: "700",
            fontStyle: "normal",
        } satisfies CSSProperties;
    }

    const accept = request.headers.get("accept");
    if (accept && accept.includes("application/json")) {
        return NextResponse.json({
            value,
            css,
        } satisfies ViewCellResponse);
    }

    if (!value) {
        value = "N/A";
    }

    const fontFamily = encodeURIComponent(css.fontFamily ?? "Pixelify Sans");
    const fontWeight = encodeURIComponent(css.fontWeight ?? "700");

    const html = `<head><meta http-equiv="refresh" content="1"><link href="https://fonts.googleapis.com/css2?family=${fontFamily}:wght@${fontWeight}&display=swap" rel="stylesheet"></head><div style="${jsToCss(css)}">${value}</div>`;

    return new Response(html, {
        headers: {
            "content-type": "text/html",
        },
    });
}
