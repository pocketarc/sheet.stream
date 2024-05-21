import { NextRequest, NextResponse } from "next/server";
import getKnex from "@/utils/getKnex";
import type { Cell, EditCellFailure, EditCellSuccess } from "@/app/types";
import { z } from "zod";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const body = await request.json();
    const knex = getKnex();

    const cell = await knex<Cell>("cells").where({ id }).first();

    if (!cell) {
        return new Response("Not found. That link's no good, get rid of it.", { status: 404 });
    }

    const zodSchema = z.object({
        id: z.string(),
        css: z.object({
            color: z.string(),
            fontSize: z.string(),
            fontWeight: z.string(),
            fontStyle: z.string(),
            fontFamily: z.string(),
        }),
    });

    const parsedFormData = zodSchema.safeParse(body);

    if (!parsedFormData.success) {
        return NextResponse.json(
            {
                type: "EditCellFailure",
                errors: parsedFormData.error.flatten().fieldErrors,
            } satisfies EditCellFailure,
            {
                status: 400,
            },
        );
    }

    const { css } = parsedFormData.data;

    await knex<Cell>("cells").where({ id }).update({ css });

    return NextResponse.json({ type: "EditCellSuccess", id } as EditCellSuccess);
}
