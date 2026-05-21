import type { Knex } from "knex";
import knex from "knex";
import knexConfig from "../../knexfile.ts";

let instance: Knex | undefined;

export function getKnex(): Knex {
    if (instance === undefined) {
        instance = knex(knexConfig);
    }

    return instance;
}
