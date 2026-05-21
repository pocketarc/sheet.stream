export default function getBackendUrl() {
    const backendUrl = process.env["NEXT_PUBLIC_BACKEND_URL"];

    if (!backendUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not set.");
    }

    return backendUrl;
}
