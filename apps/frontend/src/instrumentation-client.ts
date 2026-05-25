import { initializeFaro } from "@grafana/faro-web-sdk";

// Grafana Faro browser SDK — only initialised when a collector URL (the
// Alloy Faro receiver, or Grafana Cloud) is configured.
const faroUrl: string | undefined = process.env["NEXT_PUBLIC_FARO_URL"];

if (faroUrl !== undefined && faroUrl !== "") {
    initializeFaro({
        url: faroUrl,
        app: {
            name: "sheet-stream-frontend",
        },
    });
}
