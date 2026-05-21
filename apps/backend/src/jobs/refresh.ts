import "../otel.ts";
import type { Cell, Spreadsheet } from "@sheet-stream/shared";
import { subSeconds } from "date-fns/subSeconds";
import { getKnex } from "../db/getKnex.ts";
import { logger } from "../services/logger.ts";
import { refreshSpreadsheet } from "../services/refreshSpreadsheet.ts";

const knex = getKnex();

async function refreshSpreadsheets(): Promise<void> {
    const refreshThreshold = subSeconds(new Date(), 5);
    const cells = await knex<Cell>("cells").where("last_accessed_at", ">", refreshThreshold);
    const spreadsheetIds = new Set(cells.map((cell) => cell.spreadsheet_id));

    const spreadsheets = await knex<Spreadsheet>("spreadsheets").whereIn("id", Array.from(spreadsheetIds));

    for (const spreadsheet of spreadsheets) {
        const spreadsheetCells = cells.filter((cell) => cell.spreadsheet_id === spreadsheet.id);
        await refreshSpreadsheet(spreadsheet, spreadsheetCells);
    }

    setTimeout(refreshSpreadsheets, 5 * 1000);
}

logger.info("Refresh worker started.");
void refreshSpreadsheets();
