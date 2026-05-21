import type { Cell, Spreadsheet, StoreCellResultFailure, StoreCellResultSuccess } from "@sheet-stream/shared";
import { Hono } from "hono";
import { typeid } from "typeid-js";
import { z } from "zod";
import { getKnex } from "../db/getKnex.ts";

export const signupSheetRoutes = new Hono();

const sheetSchema = z.object({
    id: z.string(),
    sheetId: z.string(),
    sheetName: z.string(),
    sheetCell: z.string(),
});

signupSheetRoutes.post("/api/signup/sheet", async (c) => {
    const body: unknown = await c.req.json();
    const knex = getKnex();

    const parsed = sheetSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                type: "StoreCellResultFailure",
                errors: z.flattenError(parsed.error).fieldErrors,
            } satisfies StoreCellResultFailure,
            400,
        );
    }

    const { id, sheetId, sheetName, sheetCell } = parsed.data;

    const spreadsheet = await knex<Spreadsheet>("spreadsheets").where("id", id).first();

    if (spreadsheet === undefined) {
        return c.json(
            {
                type: "StoreCellResultFailure",
                errors: { sheetId: ["Sheet not found. Please start again."] },
            } satisfies StoreCellResultFailure,
            400,
        );
    }

    const cellId = typeid("cell").toString();

    await knex<Cell>("cells")
        .insert({
            id: cellId,
            spreadsheet_id: spreadsheet.id,
            sheet_id: sheetId,
            sheet_name: sheetName,
            cell: sheetCell,
        })
        .onConflict(["spreadsheet_id", "sheet_id", "sheet_name", "cell"])
        .ignore();

    const actualCell = await knex<Cell>("cells")
        .where({
            spreadsheet_id: spreadsheet.id,
            sheet_id: sheetId,
            sheet_name: sheetName,
            cell: sheetCell,
        })
        .first();

    if (actualCell === undefined) {
        return c.json(
            {
                type: "StoreCellResultFailure",
                errors: { sheetCell: ["Couldn't store cell. Please try again."] },
            } satisfies StoreCellResultFailure,
            400,
        );
    }

    return c.json({ type: "StoreCellResultSuccess", id: actualCell.id } satisfies StoreCellResultSuccess);
});
