"use client";

import { faro } from "@grafana/faro-web-sdk";
import NextError from "next/error";
import type { JSX } from "react";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }): JSX.Element {
    useEffect(() => {
        faro.api?.pushError(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <NextError statusCode={400} />
            </body>
        </html>
    );
}
