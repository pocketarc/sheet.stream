import type { CSSProperties } from "react";

// Wire-format shape for the OAuth credentials we shuttle between the backend and
// the frontend. Structurally compatible with google-auth-library's `Credentials`
// so callers can hand it to `oauth2Client.setCredentials(...)` without conversion.
export type OAuthCredentials = {
    refresh_token?: string | null;
    expiry_date?: number | null;
    access_token?: string | null;
    token_type?: string | null;
    id_token?: string | null;
    scope?: string;
};

export type Spreadsheet = {
    id: string;
    name: string;
    stream_url: string;
    token: OAuthCredentials;
    created_at: Date;
    updated_at: Date;
    last_refreshed_at: Date | null;
};

export type Cell = {
    id: string;
    spreadsheet_id: string;
    sheet_id: string;
    sheet_name: string;
    cell: string;
    css: CSSProperties | null;
    value: string | null;
    created_at: Date;
    updated_at: Date;
    last_refreshed_at: Date | null;
    last_accessed_at: Date | null;
};

export type StoreStreamDetailsResultFailure = {
    type: "StoreStreamDetailsResultFailure";
    errors: { streamUrl?: string[]; sheetsUrl?: string[]; token?: string[] };
};

export type StoreStreamDetailsResultSuccess = {
    type: "StoreStreamDetailsResultSuccess";
    id: string;
    sheets: Array<{ id: string; name: string }>;
};

export type StoreCellResultFailure = {
    type: "StoreCellResultFailure";
    errors: { sheetId?: string[]; sheetCell?: string[] };
};

export type StoreCellResultSuccess = {
    type: "StoreCellResultSuccess";
    id: string;
};

export type EditCellFailure = {
    type: "EditCellFailure";
    errors: {
        css?: string[];
    };
};

export type EditCellSuccess = {
    type: "EditCellSuccess";
    id: string;
};

export type ViewCellResponse = {
    value: string | null;
    css: CSSProperties | null;
};

export type CellEditResponse = {
    cell: Cell;
    spreadsheetName: string;
};

export type StoreStreamDetailsResult =
    | StoreStreamDetailsResultFailure
    | StoreStreamDetailsResultSuccess
    | StoreCellResultSuccess
    | StoreCellResultFailure;

export function isStoreCellResultSuccess(result: StoreStreamDetailsResult): result is StoreCellResultSuccess {
    return result.type === "StoreCellResultSuccess";
}

export function isStoreStreamDetailsResultSuccess(
    result: StoreStreamDetailsResult,
): result is StoreStreamDetailsResultSuccess {
    return result.type === "StoreStreamDetailsResultSuccess";
}

export function isStoreStreamDetailsResultFailure(
    result: StoreStreamDetailsResult,
): result is StoreStreamDetailsResultFailure {
    return result.type === "StoreStreamDetailsResultFailure";
}

export function isStoreStreamDetailsResult(value: unknown): value is StoreStreamDetailsResult {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value as {
        type?: unknown;
        id?: unknown;
        sheets?: unknown;
        errors?: unknown;
    };
    switch (candidate.type) {
        case "StoreStreamDetailsResultSuccess":
            return (
                typeof candidate.id === "string" &&
                Array.isArray(candidate.sheets) &&
                candidate.sheets.every(
                    (sheet) =>
                        typeof sheet === "object" &&
                        sheet !== null &&
                        typeof (sheet as { id?: unknown }).id === "string" &&
                        typeof (sheet as { name?: unknown }).name === "string",
                )
            );
        case "StoreCellResultSuccess":
            return typeof candidate.id === "string";
        case "StoreStreamDetailsResultFailure":
        case "StoreCellResultFailure":
            return typeof candidate.errors === "object" && candidate.errors !== null;
        default:
            return false;
    }
}

export function isCellEditResponse(value: unknown): value is CellEditResponse {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value as { cell?: unknown; spreadsheetName?: unknown };
    return (
        typeof candidate.spreadsheetName === "string" &&
        typeof candidate.cell === "object" &&
        candidate.cell !== null &&
        typeof (candidate.cell as { id?: unknown }).id === "string"
    );
}
