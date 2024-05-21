import ChangeStyle from "@/components/ChangeStyle";
import getKnex from "@/utils/getKnex";
import type { Cell } from "@/app/types";

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const knex = getKnex();
    const record = await knex<Cell>("cells").where({ id }).first();

    if (!record) {
        return <div>Not found</div>;
    }

    const spreadsheet = await knex("spreadsheets").where({ id: record.spreadsheet_id }).first();

    if (!spreadsheet) {
        return <div>Not found</div>;
    }

    const { css, value } = record;

    return (
        <>
            <ChangeStyle
                id={id}
                cell={record.cell}
                sheetName={record.sheet_name}
                spreadsheetName={spreadsheet.name}
                initialCellValue={value}
                initialCssValues={css}
            />
        </>
    );
}
