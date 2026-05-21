import knex from "knex";
import type { Knex } from "knex";
import knexConfig from "../../knexfile";

let instance: Knex | undefined;

export default function getKnex(): Knex {
    if (!instance) {
        instance = knex(knexConfig);
    }

    return instance;
}
