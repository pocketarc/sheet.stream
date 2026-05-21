import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as Sentry from "@sentry/node";
import { config } from "./config";
import { logger } from "./services/logger";
import { signupRoutes } from "./routes/signup";
import { signupSheetRoutes } from "./routes/signup-sheet";
import { cellRoutes } from "./routes/cell";
import { editRoutes } from "./routes/edit";

if (config.sentryDsn) {
    Sentry.init({
        dsn: config.sentryDsn,
        environment: config.isProduction ? "production" : "development",
    });
}

const app = new Hono();

app.use("*", cors({ origin: config.frontendBaseUrl }));

app.get("/healthz", (c) => c.text("ok"));

app.route("/", signupRoutes);
app.route("/", signupSheetRoutes);
app.route("/", cellRoutes);
app.route("/", editRoutes);

app.onError((err, c) => {
    logger.error("Unhandled error", err);
    if (config.sentryDsn) {
        Sentry.captureException(err);
    }
    return c.text("Internal Server Error", 500);
});

serve({ fetch: app.fetch, port: config.port }, (info) => {
    logger.info(`sheet-stream backend listening on port ${info.port}`);
});
