import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

// Only start OpenTelemetry when an OTLP endpoint (Grafana Alloy) is configured.
// The exporter reads OTEL_EXPORTER_OTLP_ENDPOINT and the service name reads
// OTEL_SERVICE_NAME from the environment automatically.
if (process.env["OTEL_EXPORTER_OTLP_ENDPOINT"]) {
    const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter(),
        instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
}
