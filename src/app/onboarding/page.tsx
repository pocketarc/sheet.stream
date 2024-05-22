import Onboarding from "@/components/Onboarding";

type PageParams = {
    params: Record<string, never>;
    searchParams?: {
        token?: string | string[];
    };
};

export default function Page({ searchParams }: PageParams) {
    const token = searchParams?.token;

    if (!token || typeof token !== "string") {
        return <>Error: No token found.</>;
    }

    return (
        <>
            <Onboarding token={JSON.parse(token)} />
        </>
    );
}
