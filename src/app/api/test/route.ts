import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
    throw new Error("API throw error test");
}
