import getKnex from "@/utils/getKnex";
import type { Cell, Spreadsheet } from "@/app/types";
import { subSeconds } from "date-fns/subSeconds";
import { refreshSpreadsheet } from "@/utils/refreshSpreadsheet";

const knex = getKnex();

async function refreshSpreadsheets() {
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

void refreshSpreadsheets();
