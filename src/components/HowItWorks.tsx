import Link from "next/link";
import React from "react";

export default function HowItWorks() {
    if (Date.now() > 1) {
        throw new Error("test");
    }

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-purple-800">
            <div className="mx-auto container px-4 md:px-12">
                <div className="flex flex-col justify-center space-y-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-purple-50">How it Works</h2>
                        <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-purple-300">
                            Follow these simple steps to fetch and display data from your Google Sheets on your live streams.
                        </p>
                    </div>
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold text-purple-50">Step 1: Sign in with Google</h3>
                            <p className="text-purple-300">
                                Click on the &lsquo;Sign in with Google&rsquo; button and authorize sheet.stream to access your Google Sheets.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold text-purple-50">Step 2: Select your Sheet</h3>
                            <p className="text-purple-300">Choose the Google Sheet and the specific cell you want to fetch data from.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold text-purple-50">Step 3: Display on Stream</h3>
                            <p className="text-purple-300">
                                Use the provided URL to add a browser source on OBS or any other streaming software, and display the data on your live stream.
                            </p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Link
                            prefetch={false}
                            className="inline-block truncate px-8 py-3 text-purple-50 font-title text-2xl bg-purple-950 rounded-md border-t-2 border-purple-800"
                            href="/api/signup"
                        >
                            Sign in with Google
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
