"use client";

import type React from "react";
import type { JSX } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import FontPicker, { type FontToVariant } from "react-fontpicker-ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import "react-fontpicker-ts/dist/index.css";
import type { ViewCellResponse } from "@sheet-stream/shared";
import { calcAPCA } from "apca-w3";
import { getBackendUrl } from "@/utils/getBackendUrl.ts";

type Props = {
    id: string;
    spreadsheetName: string;
    sheetName: string;
    cell: string;
    initialCellValue: string | null;
    initialCssValues: React.CSSProperties | null;
};

type FontWeight = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

const weightLabels = new Map<FontWeight, string>([
    ["100", "Thin"],
    ["200", "Extra Light"],
    ["300", "Light"],
    ["400", "Normal"],
    ["500", "Medium"],
    ["600", "Semi Bold"],
    ["700", "Bold"],
    ["800", "Extra Bold"],
    ["900", "Black"],
]);

function isFontWeight(value: string): value is FontWeight {
    return weightLabels.has(value as FontWeight);
}

function parseFontWeights(variants: FontToVariant): FontWeight[] {
    const weights: FontWeight[] = [];

    for (const variantData of variants.variants) {
        if (typeof variantData !== "string") {
            throw new Error(`Invalid variant data for font ${variants.fontName}`);
        }

        const weight = variantData.split(",")[1];

        if (weight === undefined || !isFontWeight(weight)) {
            throw new Error(`Invalid weight ${String(weight)} for font ${variants.fontName}`);
        }

        if (!weights.includes(weight)) {
            weights.push(weight);
        }
    }

    return weights;
}

export function ChangeStyle({
    id,
    spreadsheetName,
    sheetName,
    cell,
    initialCellValue,
    initialCssValues,
}: Props): JSX.Element {
    const textColorId = useId();
    const textSizeId = useId();
    const [pending, setPending] = useState(false);
    let defaultSize = initialCssValues?.fontSize ?? "48";
    if (typeof defaultSize === "string") {
        defaultSize = parseInt(defaultSize, 10);
    }

    let defaultWeight = initialCssValues?.fontWeight ?? "700";
    if (typeof defaultWeight === "number") {
        defaultWeight = defaultWeight.toString();
    }

    const [textColor, setTextColor] = useState(initialCssValues?.color ?? "#ffffff");
    const [textSize, setTextSize] = useState(defaultSize);
    const [textWeight, setTextWeight] = useState(defaultWeight);
    const [textStyle, setTextStyle] = useState(initialCssValues?.fontStyle ?? "normal");
    const [font, setFont] = useState(initialCssValues?.fontFamily ?? "Pixelify Sans");
    const [cellValue, setCellValue] = useState(initialCellValue);
    const [saved, setSaved] = useState(false);
    const [weights, setFontWeights] = useState<FontWeight[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    const handleFontChange = (variants: FontToVariant): void => {
        if (variants.fontName !== font) {
            setIsDirty(true);
        }

        setFont(variants.fontName);
        setFontWeights(parseFontWeights(variants));
    };

    const previewBackgroundColor = useMemo((): string => {
        const black = "rgb(32, 29, 37)";
        const white = "rgb(248, 248, 249)";

        let contrastBlack = calcAPCA(textColor, black);
        let contrastWhite = calcAPCA(textColor, white);

        if (typeof contrastBlack === "string") {
            contrastBlack = parseFloat(contrastBlack);
        }

        if (typeof contrastWhite === "string") {
            contrastWhite = parseFloat(contrastWhite);
        }

        contrastBlack = Math.abs(contrastBlack);
        contrastWhite = Math.abs(contrastWhite);

        return contrastBlack > contrastWhite ? black : white;
    }, [textColor]);

    const css = {
        color: textColor,
        fontSize: `${String(textSize)}px`,
        fontWeight: textWeight,
        fontStyle: textStyle,
        fontFamily: font,
        backgroundColor: previewBackgroundColor,
    };

    const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setPending(true);
        try {
            await fetch(`${getBackendUrl()}/api/edit/${id}`, {
                method: "POST",
                body: JSON.stringify({
                    id,
                    css,
                }),
            });

            setSaved(true);
            setIsDirty(false);
            setTimeout(() => {
                setSaved(false);
            }, 2000);
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        const refresh = async (): Promise<void> => {
            const res = await fetch(`${getBackendUrl()}/api/cell/${id}`, {
                headers: {
                    accept: "application/json",
                },
            });
            const data = (await res.json()) as ViewCellResponse;
            setCellValue(data.value);
        };

        const interval = setInterval(refresh, 1000);
        return (): void => {
            clearInterval(interval);
        };
    }, [id]);

    const isDisabled = !isDirty || pending;
    const buttonLabel = saved ? "Saved!" : pending ? "Saving..." : "Save";
    const url = `${getBackendUrl()}/api/cell/${id}`;

    return (
        <section className="flex flex-grow flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={onSubmit} className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Text style for <strong>{cell}</strong>
                        </CardTitle>
                        <CardDescription>
                            Customize the style of the text that will be displayed on your live stream. This is for{" "}
                            <strong>{cell}</strong> in <strong>{sheetName}</strong> of{" "}
                            <strong>{spreadsheetName}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="fontpicker-container">
                                <Label htmlFor="fontFamily">Font</Label>
                                <FontPicker
                                    autoLoad
                                    loadAllVariants
                                    defaultValue={font}
                                    fontVariants={handleFontChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={textColorId}>Text Color</Label>
                                    <Input
                                        defaultValue={textColor}
                                        id={textColorId}
                                        type="color"
                                        onInput={(e: React.InputEvent<HTMLInputElement>): void => {
                                            setTextColor(e.currentTarget.value);
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={textSizeId}>Text Size</Label>
                                    <Input
                                        defaultValue={textSize}
                                        id={textSizeId}
                                        max="1000"
                                        min="1"
                                        type="number"
                                        onInput={(e: React.InputEvent<HTMLInputElement>): void => {
                                            setTextSize(parseInt(e.currentTarget.value, 10));
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="textWeight">Text Weight</Label>
                                    <Select
                                        defaultValue={textWeight}
                                        onValueChange={(value: string): void => {
                                            setTextWeight(value);
                                            setIsDirty(true);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select weight" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {weights.map((weight) => (
                                                <SelectItem key={weight} value={weight}>
                                                    {weightLabels.get(weight)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="textStyle">Text Style</Label>
                                    <Select
                                        defaultValue={textStyle}
                                        onValueChange={(value: string): void => {
                                            setTextStyle(value);
                                            setIsDirty(true);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="italic">Italic</SelectItem>
                                            <SelectItem value="oblique">Oblique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-2 w-full overflow-hidden">
                                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Preview
                                </h3>
                                <div className="mt-2 p-8 rounded-md flex items-center justify-center" style={css}>
                                    {cellValue ?? "This is a preview of the text style."}
                                </div>
                            </div>
                            <Button className="mt-4 w-full" type="submit" disabled={isDisabled}>
                                {buttonLabel}
                            </Button>
                            <div className="mt-4 text-sm w-full">
                                <h3 className="font-semibold leading-none tracking-tight">How to use this</h3>
                                <p className="mt-1.5 text-sm text-haze-600">
                                    Add a &ldquo;Browser Source&rdquo; in your streaming software (OBS, Streamlabs,
                                    etc.) and paste the following URL:
                                </p>
                                <code className="block font-mono bg-haze-100 w-full text-haze-800 p-2 my-1.5 rounded-md break-all">
                                    {url}
                                </code>
                                <p className="mt-1.5 text-sm text-haze-600">
                                    Your text will appear on your live stream in a few seconds, and will update every
                                    few seconds.
                                </p>
                                <p className="mt-1.5 text-sm text-haze-600">
                                    You can also bookmark this page to easily edit this cell&apos;s style later.
                                </p>
                                <p className="mt-1.5 text-sm">
                                    <strong>Need help?</strong>{" "}
                                    <span className="text-haze-600">
                                        Tweet me at{" "}
                                        <a
                                            href="https://twitter.com/pocketarc"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600"
                                        >
                                            @pocketarc
                                        </a>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </section>
    );
}

/*
 */
