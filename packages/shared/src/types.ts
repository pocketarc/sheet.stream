import type { Credentials } from "google-auth-library";
import type { CSSProperties } from "react";

export type Spreadsheet = {
    id: string;
    name: string;
    stream_url: string;
    token: Credentials;
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
        id?: string[];
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
