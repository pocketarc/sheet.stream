"use client";

import { useSearchParams } from "next/navigation";
import Onboarding from "@/components/Onboarding";

export default function Page() {
    const query = useSearchParams();
    const token = query.get("token");

    if (!token) {
        return <>Error: No token found.</>;
    }

    return (
        <>
            <Onboarding token={JSON.parse(token)} />
        </>
    );
}
