import { type NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { GaxiosError } from "gaxios";
import getKnex from "@/utils/getKnex";
import getBaseUrl from "@/utils/getBaseUrl";
import { logger } from "@/utils/logger";
import { z } from "zod";
import type { Spreadsheet, StoreStreamDetailsResultFailure, StoreStreamDetailsResultSuccess } from "@/app/types";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const baseUrl = getBaseUrl();

    const oauth2Client = new google.auth.OAuth2(
        process.env["GOOGLE_CLIENT_ID"] as string,
        process.env["GOOGLE_CLIENT_SECRET"] as string,
        `${baseUrl}/api/signup`,
    );

    const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            return Response.redirect(`${baseUrl}/onboarding?token=` + JSON.stringify(tokens));
        } catch (e) {
            if (e instanceof GaxiosError) {
                if (e.response) {
                    logger.error("Error response from Google", e.response.data);
                    return Response.redirect(`${baseUrl}/onboarding?error=google_error`);
                }
            }

            logger.error("Error while fetching data", e);
            return Response.redirect(`${baseUrl}/onboarding?error=unknown`);
        }
    } else {
        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            prompt: "consent",
        });

        return Response.redirect(url);
    }
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const knex = getKnex();
    const baseUrl = getBaseUrl();

    const zodSchema = z.object({
        streamUrl: z.string(),
        sheetsUrl: z.string(),
        token: z.object({
            refresh_token: z.string(),
            expiry_date: z.number(),
            access_token: z.string(),
            token_type: z.string(),
            id_token: z.string().nullish(),
            scope: z.string(),
        }),
    });

    const parsedFormData = zodSchema.safeParse(body);

    if (!parsedFormData.success) {
        return NextResponse.json(
            {
                type: "StoreStreamDetailsResultFailure",
                errors: parsedFormData.error.flatten().fieldErrors,
            } satisfies StoreStreamDetailsResultFailure,
            {
                status: 400,
            },
        );
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env["GOOGLE_CLIENT_ID"] as string,
        process.env["GOOGLE_CLIENT_SECRET"] as string,
        `${baseUrl}/api/signup`,
    );

    // @ts-expect-error This has to do with the fact that zod's .optional() makes 'undefined' a possible type, rather than just the absence of the key.
    oauth2Client.setCredentials(parsedFormData.data.token);

    try {
        const sheets = google.sheets({ version: "v4", auth: oauth2Client });

        const sheetId = parsedFormData.data.sheetsUrl.split("/")[5];

        if (!sheetId) {
            return NextResponse.json({
                type: "StoreStreamDetailsResultFailure",
                errors: {
                    sheetsUrl: ["Invalid sheet ID. Please provide a valid sheet."],
                },
            } satisfies StoreStreamDetailsResultFailure);
        }

        const result = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        await knex<Spreadsheet>("spreadsheets")
            .insert({
                id: sheetId,
                name: result.data.properties?.title ?? "Unknown",
                stream_url: parsedFormData.data.streamUrl,
                // @ts-expect-error This has to do with the fact that zod's .optional() makes 'undefined' a possible type, rather than just the absence of the key.
                token: parsedFormData.data.token,
            })
            .onConflict("id")
            .merge();

        const sheetsData: { id: string; name: string }[] = [];
        for (const sheet of result.data.sheets ?? []) {
            if (sheet.properties) {
                sheetsData.push({
                    id: sheet.properties.sheetId + "",
                    name: sheet.properties.title ?? "Unknown",
                });
            }
        }

        return NextResponse.json({
            type: "StoreStreamDetailsResultSuccess",
            id: sheetId,
            sheets: sheetsData,
        } satisfies StoreStreamDetailsResultSuccess);
    } catch (e) {
        if (e instanceof GaxiosError) {
            if (e.response) {
                logger.error("Error response from Google", e.response);
                return NextResponse.json({
                    type: "StoreStreamDetailsResultFailure",
                    errors: {
                        token: ["Google returned an error. Please try again."],
                    },
                } satisfies StoreStreamDetailsResultFailure);
            }
        }

        logger.error("Error while fetching data", e);
        return NextResponse.json({
            type: "StoreStreamDetailsResultFailure",
            errors: {
                token: ["An error occurred while fetching data. Please try again."],
            },
        } satisfies StoreStreamDetailsResultFailure);
    }
}
