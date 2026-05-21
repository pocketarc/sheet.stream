import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-purple-800">
            <div className="mx-auto container px-4 md:px-12">
                <div className="bg-purple-50 p-12 rounded-md prose lg:prose-xl prose-headings:font-title">{children}</div>
            </div>
        </section>
    );
}
