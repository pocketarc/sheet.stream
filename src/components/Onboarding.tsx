"use client";

import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useMemo, useState } from "react";
import type { Credentials } from "google-auth-library";
import {
    isStoreStreamDetailsResultFailure,
    isStoreStreamDetailsResultSuccess,
    type StoreStreamDetailsResult,
    type StoreStreamDetailsResultFailure,
} from "@/app/types";
import { useRouter } from "next/navigation";

type Props = {
    token: Credentials;
};

export default function Onboarding({ token }: Props) {
    const router = useRouter();
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

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        try {
            if (isStoreStreamDetailsResultFailure(state)) {
                const result = await fetch("/api/signup", {
                    method: "POST",
                    body: JSON.stringify({
                        token,
                        streamUrl,
                        sheetsUrl,
                    }),
                });

                const newState: StoreStreamDetailsResult = await result.json();
                setState(newState);

                if (isStoreStreamDetailsResultSuccess(newState) && newState.sheets[0]) {
                    setSheetId(newState.sheets[0].id);
                    setSheetName(newState.sheets[0].name);
                }
            } else if (isStoreStreamDetailsResultSuccess(state)) {
                const result = await fetch("/api/signup/sheet", {
                    method: "POST",
                    body: JSON.stringify({
                        id: state.id,
                        sheetId,
                        sheetName,
                        sheetCell,
                    }),
                });

                const body = await result.json();
                router.push("/edit/" + body.id);
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

    const defaultSheetValue = useMemo(() => {
        if (isStoreStreamDetailsResultSuccess(state) && state.sheets[0]) {
            return JSON.stringify(state.sheets[0]);
        } else {
            return JSON.stringify({ name: "", id: "" });
        }
    }, [state]);

    return (
        <section className="flex flex-grow flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={onSubmit} className="w-full max-w-md">
                {isStoreStreamDetailsResultFailure(state) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome to sheet.stream</CardTitle>
                            <CardDescription>Let&apos;s get you set up to start showing off your stats.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="streamUrl">Streaming Platform URL</Label>
                                    <Input
                                        id="streamUrl"
                                        placeholder="https://twitch.tv/username"
                                        type="url"
                                        name="streamUrl"
                                        required
                                        value={streamUrl}
                                        onChange={(e) => setStreamUrl(e.target.value)}
                                    />
                                    <p className="text-sm text-haze-600">Enter the URL of your streaming channel (Twitch, YouTube, TikTok, etc.).</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sheetsUrl">Google Sheets URL</Label>
                                    <Input
                                        id="sheetsUrl"
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        type="url"
                                        name="sheetsUrl"
                                        required
                                        value={sheetsUrl}
                                        onChange={(e) => setSheetsUrl(e.target.value)}
                                    />
                                    <p className="text-sm text-haze-600">Enter the URL of the Google Sheet where you want to store your streaming data.</p>
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
                                Note: If you want to display more than one cell, you will need to go through this process for each cell.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sheet">Sheet</Label>
                                    <Select onValueChange={handleSheetChange} defaultValue={defaultSheetValue}>
                                        <SelectTrigger id="sheet">
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Select the sheet you want to display data from.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sheetCell">Cell to display</Label>
                                    <Input
                                        id="sheetCell"
                                        placeholder="A1"
                                        type="text"
                                        name="sheetCell"
                                        required
                                        value={sheetCell}
                                        onChange={(e) => setSheetCell(e.target.value)}
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
