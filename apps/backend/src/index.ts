import "./otel.ts";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config.ts";
import { cellRoutes } from "./routes/cell.ts";
import { editRoutes } from "./routes/edit.ts";
import { signupRoutes } from "./routes/signup.ts";
import { signupSheetRoutes } from "./routes/signup-sheet.ts";
import { logger } from "./services/logger.ts";

const app = new Hono();

app.use("*", cors({ origin: config.frontendBaseUrl }));

app.get("/healthz", (c) => c.text("ok"));

app.route("/", signupRoutes);
app.route("/", signupSheetRoutes);
app.route("/", cellRoutes);
app.route("/", editRoutes);

app.onError((err, c) => {
    logger.error("Unhandled error", err);
    return c.text("Internal Server Error", 500);
});

serve({ fetch: app.fetch, port: config.port }, (info) => {
    logger.info(`sheet-stream backend listening on port ${String(info.port)}`);
});
