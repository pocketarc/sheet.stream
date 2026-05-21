type Config = {
    port: number;
    backendBaseUrl: string;
    frontendBaseUrl: string;
    googleClientId: string;
    googleClientSecret: string;
    isProduction: boolean;
};

export const config: Config = {
    port: Number(process.env["PORT"] ?? 3001),
    // Used to build the Google OAuth redirect URI; must be an authorized redirect
    // URI in the Google Cloud console (e.g. https://api.sheet.stream).
    backendBaseUrl: process.env["BACKEND_BASE_URL"] ?? "http://localhost:3001",
    // Where the OAuth flow sends the user back to, and the allowed CORS origin.
    frontendBaseUrl: process.env["FRONTEND_BASE_URL"] ?? "http://localhost:3000",
    googleClientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
    googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    isProduction: process.env["NODE_ENV"] === "production",
};
