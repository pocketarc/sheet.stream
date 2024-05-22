import type { Cell, Spreadsheet } from "@/app/types";
import getKnex from "@/utils/getKnex";
import { getCellValues } from "@/utils/getCellValues";
import { logger } from "@/utils/logger";

export async function refreshSpreadsheet(spreadsheet: Spreadsheet, spreadsheetCells: Cell[]): Promise<void> {
    const knex = getKnex();

    logger.info(`Updating spreadsheet.`, {
        spreadsheet: spreadsheet.id,
        cells: spreadsheetCells.map((cell) => cell.cell),
    });

    const cellValues = await getCellValues(spreadsheet, spreadsheetCells);

    for (const [cell, value] of Object.entries(cellValues)) {
        const cellRecord = spreadsheetCells.find((cellRecord) => cellRecord.cell === cell);

        if (cellRecord) {
            if (cellRecord.value !== value) {
                logger.info(`Updated cell value.`, {
                    spreadsheet: spreadsheet.id,
                    cell: cellRecord.cell,
                    value,
                });
            } else {
                logger.info(`Cell value unchanged.`, {
                    spreadsheet: spreadsheet.id,
                    cell: cellRecord.cell,
                    value,
                });
            }

            const queries = [
                knex<Cell>("cells").where("id", cellRecord.id).update({
                    value,
                    last_refreshed_at: new Date(),
                }),
                knex<Spreadsheet>("spreadsheets").where("id", spreadsheet.id).update({
                    last_refreshed_at: new Date(),
                }),
            ];

            await Promise.all(queries);
        } else {
            logger.error(`Cell not found in spreadsheetCells despite us having just fetched it.`, {
                spreadsheet: spreadsheet.id,
                cell,
                value,
            });
        }
    }
}
