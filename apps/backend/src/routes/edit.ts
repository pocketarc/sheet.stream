import type { Cell, EditCellFailure, EditCellSuccess } from "@sheet-stream/shared";
import { Hono } from "hono";
import { z } from "zod";
import { getKnex } from "../db/getKnex.ts";

export const editRoutes = new Hono();

const editSchema = z.object({
    id: z.string(),
    css: z.object({
        color: z.string(),
        fontSize: z.string(),
        fontWeight: z.string(),
        fontStyle: z.string(),
        fontFamily: z.string(),
    }),
});

editRoutes.post("/api/edit/:id", async (c) => {
    const id = c.req.param("id");
    const body: unknown = await c.req.json();
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (cell === undefined) {
        return c.text("Not found. That link's no good, get rid of it.", 404);
    }

    const parsed = editSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            { type: "EditCellFailure", errors: z.flattenError(parsed.error).fieldErrors } satisfies EditCellFailure,
            400,
        );
    }

    const { css } = parsed.data;

    // MySQL JSON columns need a stringified value on UPDATE; mysql2 parses it back on read.
    await knex("cells")
        .where({ id })
        .update({ css: JSON.stringify(css) });

    return c.json({ type: "EditCellSuccess", id } satisfies EditCellSuccess);
});
