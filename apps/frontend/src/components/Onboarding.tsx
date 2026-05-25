"use client";

import {
    isStoreCellResultSuccess,
    isStoreStreamDetailsResult,
    isStoreStreamDetailsResultFailure,
    isStoreStreamDetailsResultSuccess,
    type OAuthCredentials,
    type StoreStreamDetailsResult,
    type StoreStreamDetailsResultFailure,
} from "@sheet-stream/shared";
import { useRouter } from "next/navigation";
import type React from "react";
import type { JSX } from "react";
import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { getBackendUrl } from "@/utils/getBackendUrl.ts";

type Props = {
    token: OAuthCredentials;
};

// Returns null when the response is non-2xx without a recognisable result body
// or when the fetch itself fails — callers should surface a generic error in
// either case.
async function postJson(url: string, payload: object): Promise<StoreStreamDetailsResult | null> {
    let result: Response;
    try {
        result = await fetch(url, { method: "POST", body: JSON.stringify(payload) });
    } catch {
        return null;
    }

    const body: unknown = await result.json().catch(() => null);

    return isStoreStreamDetailsResult(body) ? body : null;
}

export function Onboarding({ token }: Props): JSX.Element {
    const router = useRouter();
    const streamUrlId = useId();
    const sheetsUrlId = useId();
    const sheetSelectId = useId();
    const sheetCellId = useId();
    const [sheetsUrl, setSheetsUrl] = useState("");
    const [sheetCell, setSheetCell] = useState("");
    const [sheetId, setSheetId] = useState<string | null>(null);
    const [sheetName, setSheetName] = useState<string | null>(null);
    const [streamUrl, setStreamUrl] = useState("");
    const [state, setState] = useState<StoreStreamDetailsResult>({
        type: "StoreStreamDetailsResultFailure",
        errors: {},
    } satisfies StoreStreamDetailsResultFailure);
    const [pending, setPending] = useState(false);

    const networkErrorState: StoreStreamDetailsResultFailure = {
        type: "StoreStreamDetailsResultFailure",
        errors: { token: ["Network error. Please try again."] },
    };

    const submitStreamDetails = async (): Promise<void> => {
        const newState = await postJson(`${getBackendUrl()}/api/signup`, { token, streamUrl, sheetsUrl });
        if (newState === null) {
            setState(networkErrorState);
            return;
        }

        setState(newState);

        const firstSheet = isStoreStreamDetailsResultSuccess(newState) ? newState.sheets[0] : undefined;
        if (firstSheet !== undefined) {
            setSheetId(firstSheet.id);
            setSheetName(firstSheet.name);
        }
    };

    const submitChosenCell = async (signupId: string): Promise<void> => {
        const body = await postJson(`${getBackendUrl()}/api/signup/sheet`, {
            id: signupId,
            sheetId,
            sheetName,
            sheetCell,
        });
        if (body === null) {
            setState(networkErrorState);
            return;
        }

        if (isStoreCellResultSuccess(body)) {
            router.push(`/edit?id=${body.id}`);
        } else {
            setState(body);
        }
    };

    const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setPending(true);
        try {
            if (isStoreStreamDetailsResultFailure(state)) {
                await submitStreamDetails();
            } else if (isStoreStreamDetailsResultSuccess(state)) {
                await submitChosenCell(state.id);
            } else {
                throw new Error(
                    "Invalid state; tried to submit form when the state wasn't either a StoreStreamDetailsResultFailure or a StoreStreamDetailsResultSuccess.",
                );
            }
        } finally {
            setPending(false);
        }
    };

    const handleSheetChange = (value: string): void => {
        const sheet = JSON.parse(value) as { name: string; id: string };
        setSheetId(sheet.id);
        setSheetName(sheet.name);
    };

    const defaultSheetValue = useMemo((): string => {
        const firstSheet = isStoreStreamDetailsResultSuccess(state) ? state.sheets[0] : undefined;
        if (firstSheet !== undefined) {
            return JSON.stringify(firstSheet);
        }
        return JSON.stringify({ name: "", id: "" });
    }, [state]);

    return (
        <section className="flex flex-grow flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={onSubmit} className="w-full max-w-md">
                {isStoreStreamDetailsResultFailure(state) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to sheet.stream</CardTitle>
                            <CardDescription>
                                Let&apos;s get you set up to start showing off your stats.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor={streamUrlId}>Streaming Platform URL</Label>
                                    <Input
                                        id={streamUrlId}
                                        placeholder="https://twitch.tv/username"
                                        type="url"
                                        name="streamUrl"
                                        required
                                        value={streamUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                            setStreamUrl(e.target.value);
                                        }}
                                    />
                                    <p className="text-sm text-haze-600">
                                        Enter the URL of your streaming channel (Twitch, YouTube, TikTok, etc.).
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={sheetsUrlId}>Google Sheets URL</Label>
                                    <Input
                                        id={sheetsUrlId}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        type="url"
                                        name="sheetsUrl"
                                        required
                                        value={sheetsUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                            setSheetsUrl(e.target.value);
                                        }}
                                    />
                                    <p className="text-sm text-haze-600">
                                        Enter the URL of the Google Sheet where you want to store your streaming data.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={pending}>
                                {pending ? "Loading..." : "Continue"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
                {isStoreStreamDetailsResultSuccess(state) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pick a cell</CardTitle>
                            <CardDescription>
                                Enter the cell that has the data you want to display on your stream (e.g. A1, H4).
                                <br />
                                <br />
                                Note: If you want to display more than one cell, you will need to go through this
                                process for each cell.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor={sheetSelectId}>Sheet</Label>
                                    <Select onValueChange={handleSheetChange} defaultValue={defaultSheetValue}>
                                        <SelectTrigger id={sheetSelectId}>
                                            <SelectValue placeholder="Select a sheet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {state.sheets.map((sheet) => (
                                                <SelectItem key={sheet.name} value={JSON.stringify(sheet)}>
                                                    {sheet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Select the sheet you want to display data from.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={sheetCellId}>Cell to display</Label>
                                    <Input
                                        id={sheetCellId}
                                        placeholder="A1"
                                        type="text"
                                        name="sheetCell"
                                        required
                                        value={sheetCell}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                            setSheetCell(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={pending}>
                                {pending ? "Loading..." : "Continue"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </form>
        </section>
    );
}

/*
 */
