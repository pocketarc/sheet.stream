"use client";

import { type CellEditResponse, isCellEditResponse } from "@sheet-stream/shared";
import { useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { Suspense, useEffect, useState } from "react";
import { ChangeStyle } from "@/components/ChangeStyle.tsx";
import { getBackendUrl } from "@/utils/getBackendUrl.ts";

async function fetchCellEdit(id: string, signal: AbortSignal): Promise<CellEditResponse | null> {
    try {
        const res = await fetch(`${getBackendUrl()}/api/cell/${id}/edit`, { signal });
        if (!res.ok) {
            return null;
        }
        const body: unknown = await res.json();
        return isCellEditResponse(body) ? body : null;
    } catch {
        return null;
    }
}

function EditPage(): JSX.Element {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [data, setData] = useState<CellEditResponse | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (id === null || id === "") {
            setError(true);
            return;
        }

        const controller = new AbortController();

        void fetchCellEdit(id, controller.signal).then((result) => {
            if (controller.signal.aborted) {
                return;
            }
            if (result === null) {
                setError(true);
            } else {
                setData(result);
            }
        });

        return (): void => {
            controller.abort();
        };
    }, [id]);

    if (error) {
        return <div>Not found</div>;
    }

    if (data === null) {
        return <div>Loading...</div>;
    }

    return (
        <ChangeStyle
            id={data.cell.id}
            cell={data.cell.cell}
            sheetName={data.cell.sheet_name}
            spreadsheetName={data.spreadsheetName}
            initialCellValue={data.cell.value}
            initialCssValues={data.cell.css}
        />
    );
}

export default function Page(): JSX.Element {
    return (
        <Suspense>
            <EditPage />
        </Suspense>
    );
}
