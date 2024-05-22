import type { Cell, Spreadsheet } from "@/app/types";
import { google } from "googleapis";
import { GaxiosError } from "gaxios";
import { logger } from "@/utils/logger";

export async function getCellValues(spreadsheet: Spreadsheet, cells: Cell[]): Promise<Record<string, string | null>> {
    const oauth2Client = new google.auth.OAuth2(process.env["GOOGLE_CLIENT_ID"] as string, process.env["GOOGLE_CLIENT_SECRET"] as string);

    oauth2Client.setCredentials(spreadsheet.token);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const result: Record<string, string | null> = {};

    for (const cell of cells) {
        result[cell.cell] = null;
    }

    try {
        const values = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: spreadsheet.id,
            ranges: cells.map((cell) => `'${cell.sheet_name}'!${cell.cell}`),
        });

        if (values.data.valueRanges) {
            for (const valueRange of values.data.valueRanges) {
                let cell = valueRange.range;
                const value = valueRange.values;

                if (cell && value) {
                    cell = cell.split("!")[1];

                    if (cell && typeof value[0] !== "undefined" && typeof value[0][0] !== "undefined" && typeof value[0][0] === "string") {
                        result[cell] = value[0][0];
                    }
                }
            }
        }
    } catch (e) {
        if (e instanceof GaxiosError) {
            logger.error(`Failed to fetch cell values.`, {
                spreadsheet: spreadsheet.id,
                error: {
                    code: e.code,
                    message: e.message,
                    response: e.response?.data,
                },
            });
        } else {
            logger.error(`Failed to fetch cell values.`, {
                spreadsheet: spreadsheet.id,
                error: e,
            });
        }
    }

    return result;
}
