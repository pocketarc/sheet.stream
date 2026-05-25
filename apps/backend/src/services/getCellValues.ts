import type { Cell, Spreadsheet } from "@sheet-stream/shared";
import { GaxiosError } from "gaxios";
import type { sheets_v4 } from "googleapis";
import { google } from "googleapis";
import { config } from "../config.ts";
import { logger } from "./logger.ts";

function extractCellName(range: string): string | undefined {
    return range.split("!")[1];
}

function extractStringValue(values: sheets_v4.Schema$ValueRange["values"]): string | undefined {
    const firstRow: unknown = values?.[0];
    const firstCell: unknown = Array.isArray(firstRow) ? firstRow[0] : undefined;

    if (typeof firstCell === "string") {
        return firstCell;
    }

    if (typeof firstCell === "number") {
        return String(firstCell);
    }

    return undefined;
}

function applyValueRanges(valueRanges: sheets_v4.Schema$ValueRange[], result: Map<string, string | null>): void {
    for (const valueRange of valueRanges) {
        if (valueRange.range === undefined || valueRange.range === null) {
            continue;
        }

        const cell = extractCellName(valueRange.range);
        const value = extractStringValue(valueRange.values);

        if (cell !== undefined && value !== undefined) {
            result.set(cell, value);
        }
    }
}

export async function getCellValues(spreadsheet: Spreadsheet, cells: Cell[]): Promise<Record<string, string | null>> {
    const oauth2Client = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret);

    oauth2Client.setCredentials(spreadsheet.token);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const result = new Map<string, string | null>();

    for (const cell of cells) {
        result.set(cell.cell, null);
    }

    try {
        const values = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: spreadsheet.id,
            ranges: cells.map((cell) => `'${cell.sheet_name}'!${cell.cell}`),
        });

        if (values.data.valueRanges !== undefined) {
            applyValueRanges(values.data.valueRanges, result);
        }
    } catch (e) {
        if (e instanceof GaxiosError) {
            logger.error("Failed to fetch cell values.", {
                spreadsheet: spreadsheet.id,
                error: {
                    code: e.code,
                    message: e.message,
                    response: e.response?.data as unknown,
                },
            });
        } else {
            logger.error("Failed to fetch cell values.", {
                spreadsheet: spreadsheet.id,
                error: e,
            });
        }
    }

    return Object.fromEntries(result);
}
