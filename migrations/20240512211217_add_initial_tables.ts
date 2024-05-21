import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("spreadsheets", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.string("stream_url").notNullable();
        table.jsonb("token").notNullable();
        table.timestamp("created_at", { useTz: true, precision: 3 }).defaultTo(knex.fn.now()).notNullable();
        table.timestamp("updated_at", { useTz: true, precision: 3 }).defaultTo(knex.fn.now()).notNullable();
        table.timestamp("last_refreshed_at", { useTz: true, precision: 3 });
    });

    await knex.schema.createTable("cells", (table) => {
        table.string("id").primary();
        table.string("spreadsheet_id").notNullable();
        table.foreign("spreadsheet_id").references("spreadsheets.id").onDelete("CASCADE");
        table.string("sheet_id");
        table.string("sheet_name");
        table.string("cell");
        table.jsonb("css");
        table.text("value");
        table.timestamp("created_at", { useTz: true, precision: 3 }).defaultTo(knex.fn.now()).notNullable();
        table.timestamp("updated_at", { useTz: true, precision: 3 }).defaultTo(knex.fn.now()).notNullable();
        table.timestamp("last_refreshed_at", { useTz: true, precision: 3 });
        table.timestamp("last_accessed_at", { useTz: true, precision: 3 });
        table.unique(["spreadsheet_id", "sheet_id", "sheet_name", "cell"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("cells");
    await knex.schema.dropTable("spreadsheets");
}
