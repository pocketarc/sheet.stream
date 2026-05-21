import type {
    Credentials,
    Spreadsheet,
    StoreStreamDetailsResultFailure,
    StoreStreamDetailsResultSuccess,
} from "@sheet-stream/shared";
import { GaxiosError } from "gaxios";
import { google } from "googleapis";
import { Hono } from "hono";
import { z } from "zod";
import { config } from "../config.ts";
import { getKnex } from "../db/getKnex.ts";
import { logger } from "../services/logger.ts";

export const signupRoutes = new Hono();

const scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const tokenSchema = z.object({
    refresh_token: z.string(),
    expiry_date: z.number(),
    access_token: z.string(),
    token_type: z.string(),
    id_token: z.string().nullish(),
    scope: z.string(),
});

// `id_token` is parsed as optional, so its value can be `undefined`. The
// google-auth-library `Credentials` type uses `exactOptionalPropertyTypes`
// semantics, where a present key must not hold `undefined`. Rebuild the object
// so the key is simply omitted when no id token is present.
function toCredentials(token: z.infer<typeof tokenSchema>): Credentials {
    const credentials: Credentials = {
        refresh_token: token.refresh_token,
        expiry_date: token.expiry_date,
        access_token: token.access_token,
        token_type: token.token_type,
        scope: token.scope,
    };

    if (token.id_token !== undefined) {
        credentials.id_token = token.id_token;
    }

    return credentials;
}

function createOAuthClient(): InstanceType<typeof google.auth.OAuth2> {
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

    if (code !== undefined && code !== "") {
        try {
            const { tokens } = await oauth2Client.getToken(code);
            return c.redirect(
                `${config.frontendBaseUrl}/onboarding?token=${encodeURIComponent(JSON.stringify(tokens))}`,
            );
        } catch (e) {
            if (e instanceof GaxiosError && e.response !== undefined) {
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
    const body: unknown = await c.req.json();
    const knex = getKnex();

    const zodSchema = z.object({
        streamUrl: z.string(),
        sheetsUrl: z.string(),
        token: tokenSchema,
    });

    const parsedFormData = zodSchema.safeParse(body);

    if (!parsedFormData.success) {
        return c.json(
            {
                type: "StoreStreamDetailsResultFailure",
                errors: z.flattenError(parsedFormData.error).fieldErrors,
            } satisfies StoreStreamDetailsResultFailure,
            400,
        );
    }

    const credentials = toCredentials(parsedFormData.data.token);

    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(credentials);

    try {
        const sheets = google.sheets({ version: "v4", auth: oauth2Client });

        const sheetId = parsedFormData.data.sheetsUrl.split("/")[5];

        if (sheetId === undefined || sheetId === "") {
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
                token: credentials,
            })
            .onConflict("id")
            .merge();

        const sheetsData: { id: string; name: string }[] = [];
        for (const sheet of result.data.sheets ?? []) {
            if (sheet.properties !== undefined) {
                sheetsData.push({
                    id: String(sheet.properties.sheetId),
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
        if (e instanceof GaxiosError && e.response !== undefined) {
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
