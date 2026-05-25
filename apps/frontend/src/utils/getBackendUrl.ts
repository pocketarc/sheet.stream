export function getBackendUrl(): string {
    const backendUrl = process.env["NEXT_PUBLIC_BACKEND_URL"];

    if (backendUrl === undefined || backendUrl === "") {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not set.");
    }

    return backendUrl;
}
