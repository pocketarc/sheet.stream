export default function getBaseUrl() {
    const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"];

    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not set.");
    }

    return baseUrl;
}
