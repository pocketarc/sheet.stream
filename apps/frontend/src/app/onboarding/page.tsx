"use client";

import type { Credentials } from "@sheet-stream/shared";
import { useSearchParams } from "next/navigation";
import type { JSX } from "react";
import { Suspense } from "react";
import { Onboarding } from "@/components/Onboarding.tsx";

function OnboardingPage(): JSX.Element {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    if (token === null || token === "") {
        return <>Error: No token found.</>;
    }

    // The token is an opaque OAuth credentials blob produced by our backend's
    // redirect; the backend re-validates it with Zod when it's submitted.
    let credentials: Credentials;
    try {
        credentials = JSON.parse(token) as Credentials;
    } catch {
        return <>Error: Invalid token.</>;
    }

    return <Onboarding token={credentials} />;
}

export default function Page(): JSX.Element {
    return (
        <Suspense>
            <OnboardingPage />
        </Suspense>
    );
}
