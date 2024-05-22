import type { Metadata, Viewport } from "next";
import { Pixelify_Sans as Pixelify } from "next/font/google";
import "./globals.css";
import React from "react";
import Script from "next/script";
import Footer from "@/components/Footer";
import getBaseUrl from "@/utils/getBaseUrl.ts";

const pixelify = Pixelify({ weight: "400", subsets: ["latin"], variable: "--font-title" });

export const viewport: Viewport = {
    themeColor: "#8944be",
    initialScale: 1,
    width: "device-width",
};

const baseUrl = getBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
    const title = `sheet.stream`;
    const description = `Display data from a Google Sheet on your Twitch/YouTube/TikTok streams in real-time. Free, easy to setup, and customizable.`;

    return {
        metadataBase: new URL(baseUrl),
        title: `${title} - Display data from a Google Sheet on your Twitch/YouTube/TikTok streams in real-time.`,
        description,
        alternates: {
            canonical: baseUrl,
        },
        openGraph: {
            type: "website",
            url: baseUrl,
        },
        twitter: {
            card: "summary",
            title: title,
            description: description,
            creator: "@pocketarc",
            site: "@pocketarc",
        },
    };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const domain = new URL(baseUrl).hostname;

    return (
        <html lang="en" className="h-full bg-purple-600">
            <body className={`font-body ${pixelify.variable} h-full`}>
                <div className="flex flex-col min-h-screen text-purple-100">
                    <main className="flex-1 flex flex-col">{children}</main>
                    <Footer />
                </div>
            </body>
            <Script src={`${baseUrl}/js/script.js`} strategy="afterInteractive" data-domain={domain} data-api="/api/event" />
        </html>
    );
}
