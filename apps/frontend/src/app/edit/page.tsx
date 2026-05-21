"use client";

import type { CellEditResponse } from "@sheet-stream/shared";
import { useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { Suspense, useEffect, useState } from "react";
import { ChangeStyle } from "@/components/ChangeStyle.tsx";
import { getBackendUrl } from "@/utils/getBackendUrl.ts";

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

        let cancelled = false;

        void (async (): Promise<void> => {
            const res = await fetch(`${getBackendUrl()}/api/cell/${id}/edit`);

            if (cancelled) {
                return;
            }

            if (!res.ok) {
                setError(true);
                return;
            }

            setData((await res.json()) as CellEditResponse);
        })();

        return (): void => {
            cancelled = true;
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
