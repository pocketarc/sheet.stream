import type {
    Spreadsheet,
    StoreStreamDetailsResultFailure,
    StoreStreamDetailsResultSuccess,
} from "@sheet-stream/shared";
import { GaxiosError } from "gaxios";
import { google } from "googleapis";
import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.ts";
import getKnex from "../db/getKnex.ts";
import { logger } from "../services/logger.ts";

export const signupRoutes = new Hono();

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function createOAuthClient() {
    return new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        `${config.backendBaseUrl}/api/signup`,
    );
}

// Step 1: start the OAuth flow; step 3: handle Google's callback. The callback
// hands the user back to the frontend with the obtained token in the query.
signupRoutes.get("/api/signup", async (c) => {
    const code = c.req.query("code");
    const oauth2Client = createOAuthClient();

    if (code) {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            return c.redirect(
                `${config.frontendBaseUrl}/onboarding?token=${encodeURIComponent(JSON.stringify(tokens))}`,
            );
        } catch (e) {
            if (e instanceof GaxiosError && e.response) {
                logger.error("Error response from Google", e.response.data);
                return c.redirect(`${config.frontendBaseUrl}/onboarding?error=google_error`);
            }

            logger.error("Error while fetching data", e);
            return c.redirect(`${config.frontendBaseUrl}/onboarding?error=unknown`);
        }
    }

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
    });

    return c.redirect(url);
});

// Step 2: store the spreadsheet the user picked and list its sheets.
signupRoutes.post("/api/signup", async (c) => {
    const body = await c.req.json();
    const knex = getKnex();

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
        return c.json(
            {
                type: "StoreStreamDetailsResultFailure",
                errors: parsedFormData.error.flatten().fieldErrors,
            } satisfies StoreStreamDetailsResultFailure,
            400,
        );
    }

    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(parsedFormData.data.token);

    try {
        const sheets = google.sheets({ version: "v4", auth: oauth2Client });

        const sheetId = parsedFormData.data.sheetsUrl.split("/")[5];

        if (!sheetId) {
            return c.json({
                type: "StoreStreamDetailsResultFailure",
                errors: { sheetsUrl: ["Invalid sheet ID. Please provide a valid sheet."] },
            } satisfies StoreStreamDetailsResultFailure);
        }

        const result = await sheets.spreadsheets.get({ spreadsheetId: sheetId });

        await knex<Spreadsheet>("spreadsheets")
            .insert({
                id: sheetId,
                name: result.data.properties?.title ?? "Unknown",
                stream_url: parsedFormData.data.streamUrl,
                token: parsedFormData.data.token,
            })
            .onConflict("id")
            .merge();

        const sheetsData: { id: string; name: string }[] = [];
        for (const sheet of result.data.sheets ?? []) {
            if (sheet.properties) {
                sheetsData.push({
                    id: `${sheet.properties.sheetId}`,
                    name: sheet.properties.title ?? "Unknown",
                });
            }
        }

        return c.json({
            type: "StoreStreamDetailsResultSuccess",
            id: sheetId,
            sheets: sheetsData,
        } satisfies StoreStreamDetailsResultSuccess);
    } catch (e) {
        if (e instanceof GaxiosError && e.response) {
            logger.error("Error response from Google", e.response);
            return c.json({
                type: "StoreStreamDetailsResultFailure",
                errors: { token: ["Google returned an error. Please try again."] },
            } satisfies StoreStreamDetailsResultFailure);
        }

        logger.error("Error while fetching data", e);
        return c.json({
            type: "StoreStreamDetailsResultFailure",
            errors: { token: ["An error occurred while fetching data. Please try again."] },
        } satisfies StoreStreamDetailsResultFailure);
    }
});
