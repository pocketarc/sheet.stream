"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Onboarding from "@/components/Onboarding.tsx";

function OnboardingPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    if (!token) {
        return <>Error: No token found.</>;
    }

    return <Onboarding token={JSON.parse(token)} />;
}

export default function Page() {
    return (
        <Suspense>
            <OnboardingPage />
        </Suspense>
    );
}
