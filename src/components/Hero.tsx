"use client";

import Link from "next/link";
import Image from "next/image";
import heroImage from "@/app/sheet-stream.png";
import React from "react";

export default function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="mx-auto container px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center lg:space-x-12 xl:space-x-24 2xl:space-x-32 text-center lg:text-left">
                    <div className="lg:flex-1 md:text-3xl font-body md:leading-snug text-shadow shadow-purple-800">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-8xl text-white font-title">sheet.stream</h1>
                        <p className="mt-4">Display data from a Google Sheet on your Twitch/YouTube/TikTok streams in real-time.</p>
                        <p className="mt-4">Free, easy to setup, and customizable.</p>
                        <div className="mt-8">
                            <Link
                                className="inline-block truncate px-8 py-3 text-purple-50 font-title text-2xl bg-purple-950 rounded-md border-t-2 border-purple-800"
                                href="/api/signup"
                            >
                                Sign in with Google
                            </Link>
                        </div>
                    </div>
                    <div className="">
                        <Image alt="Hero Image" src={heroImage} />
                    </div>
                </div>
            </div>
        </section>
    );
}
