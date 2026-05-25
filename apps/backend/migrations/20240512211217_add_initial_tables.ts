import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("spreadsheets", (table) => {
        // 191 chars keeps utf8mb4 string columns within InnoDB index key limits.
        table.string("id", 191).primary();
        table.string("name").notNullable();
        table.string("stream_url").notNullable();
        table.json("token").notNullable();
        table.timestamp("created_at", { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable();
        table.timestamp("updated_at", { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable();
        table.timestamp("last_refreshed_at", { precision: 3 });
    });

    await knex.schema.createTable("cells", (table) => {
        table.string("id").primary();
        // These four columns form the composite unique index below; at 191
        // chars each they fit within InnoDB's 3072-byte index key limit.
        table.string("spreadsheet_id", 191).notNullable();
        table.foreign("spreadsheet_id").references("spreadsheets.id").onDelete("CASCADE");
        table.string("sheet_id", 191).notNullable();
        table.string("sheet_name", 191).notNullable();
        table.string("cell", 191).notNullable();
        table.json("css");
        table.text("value");
        table.timestamp("created_at", { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable();
        table.timestamp("updated_at", { precision: 3 }).defaultTo(knex.fn.now(3)).notNullable();
        table.timestamp("last_refreshed_at", { precision: 3 });
        table.timestamp("last_accessed_at", { precision: 3 });
        table.unique(["spreadsheet_id", "sheet_id", "sheet_name", "cell"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("cells");
    await knex.schema.dropTable("spreadsheets");
}
