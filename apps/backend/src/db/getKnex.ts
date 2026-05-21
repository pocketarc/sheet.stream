import type { Knex } from "knex";
import knex from "knex";
import knexConfig from "../../knexfile.ts";

let instance: Knex | undefined;

export default function getKnex(): Knex {
    if (!instance) {
        instance = knex(knexConfig);
    }

    return instance;
}
