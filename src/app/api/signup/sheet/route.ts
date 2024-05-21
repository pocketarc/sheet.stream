import { NextRequest, NextResponse } from "next/server";
import type { Cell, Spreadsheet, StoreCellResultFailure, StoreCellResultSuccess } from "@/app/types";
import getKnex from "@/utils/getKnex";
import { z } from "zod";
import { typeid } from "typeid-js";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const knex = getKnex();

    const zodSchema = z.object({
        id: z.string(),
        sheetId: z.string(),
        sheetName: z.string(),
        sheetCell: z.string(),
    });

    const parsedFormData = zodSchema.safeParse(body);

    if (!parsedFormData.success) {
        return NextResponse.json(
            {
                type: "StoreCellResultFailure",
                errors: parsedFormData.error.flatten().fieldErrors,
            } satisfies StoreCellResultFailure,
            {
                status: 400,
            },
        );
    }

    const { id, sheetId, sheetName, sheetCell } = parsedFormData.data;

    const spreadsheet = await knex<Spreadsheet>("spreadsheets").where("id", id).first();

    if (!spreadsheet) {
        return NextResponse.json(
            {
                type: "StoreCellResultFailure",
                errors: {
                    sheetId: ["Sheet not found. Please start again."],
                },
            } satisfies StoreCellResultFailure,
            {
                status: 400,
            },
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

    if (!actualCell) {
        return NextResponse.json(
            {
                type: "StoreCellResultFailure",
                errors: {
                    sheetCell: ["Couldn't store cell. Please try again."],
                },
            } satisfies StoreCellResultFailure,
            {
                status: 400,
            },
        );
    }

    return NextResponse.json({
        type: "StoreCellResultSuccess",
        id: actualCell.id,
    } satisfies StoreCellResultSuccess);
}
