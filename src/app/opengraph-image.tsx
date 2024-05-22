import { ImageResponse } from "next/og";
import getBaseUrl from "@/utils/getBaseUrl.ts";

export const alt = "sheet.stream";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
    const pixelifyUrl = "https://fonts.gstatic.com/s/pixelifysans/v1/CHy2V-3HFUT7aC4iv1TxGDR9DHEserHN25py2TTb0H1bb5Jag3GU.woff";
    const interUrl = "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZs.woff";
    const pixelify = fetch(new URL(pixelifyUrl)).then((res) => res.arrayBuffer());
    const inter = fetch(new URL(interUrl)).then((res) => res.arrayBuffer());

    const subtitle = `Display data from a Google Sheet on your Twitch/YouTube/TikTok streams in real-time. Free, easy to setup, and customizable. 📊 🚀`;
    const showImage = `${getBaseUrl()}/sheet-stream.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    backgroundColor: "#8944be",
                    color: "#ffffff",
                    textShadow: "2px 2px 0px black",
                    gap: "32px",
                }}
            >
                <h1 style={{ textAlign: "center", fontFamily: "Pixelify", fontSize: "128px", lineHeight: "1", margin: "0px" }}>{alt}</h1>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexShrink: "1",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "16px",
                    }}
                >
                    <h2 style={{ textAlign: "center", fontFamily: "Inter", fontSize: "48px", lineHeight: "1.375", margin: "0px" }}>{subtitle}</h2>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "50%",
                            height: "100%",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={showImage}
                            alt=""
                            style={{
                                width: "598px",
                                height: "502px",
                            }}
                        />
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: "Pixelify",
                    data: await pixelify,
                    style: "normal",
                    weight: 400,
                },
                {
                    name: "Inter",
                    data: await inter,
                    style: "normal",
                    weight: 400,
                },
            ],
        },
    );
}
