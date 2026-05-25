import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Knex } from "knex";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (
    !process.env["DB_USERNAME"] ||
    !process.env["DB_PASSWORD"] ||
    !process.env["DB_DATABASE"] ||
    !process.env["DB_HOST"] ||
    !process.env["DB_PORT"]
) {
    throw new Error("DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST, or DB_PORT is not defined.");
}

const rawDbPort: string = process.env["DB_PORT"];
const dbPort: number = Number.parseInt(rawDbPort, 10);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    throw new Error(`Invalid DB_PORT: ${rawDbPort}`);
}

const config: Knex.Config = {
    client: "mysql2",
    connection: {
        user: process.env["DB_USERNAME"],
        password: process.env["DB_PASSWORD"],
        database: process.env["DB_DATABASE"],
        host: process.env["DB_HOST"],
        port: dbPort,
        // Interpret all DB datetimes as UTC so mysql2 round-trips TIMESTAMP
        // columns consistently (the server runs --default-time-zone=+00:00).
        timezone: "Z",
    },
    pool: {
        min: 2,
        max: 2,
    },
    migrations: {
        directory: `${__dirname}/migrations`,
        tableName: "migrations",
        extension: "ts",
    },
};

export default config;
