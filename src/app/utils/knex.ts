import knexBuilder from "knex";
import type { Knex } from "knex";
import knexConfig from "../../../knexfile";

const knex: Knex = knexBuilder(knexConfig);

export default knex;
