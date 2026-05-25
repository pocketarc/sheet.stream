export function getBaseUrl(): string {
    const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"];

    if (baseUrl === undefined || baseUrl === "") {
        throw new Error("NEXT_PUBLIC_BASE_URL is not set.");
    }

    return baseUrl;
}
