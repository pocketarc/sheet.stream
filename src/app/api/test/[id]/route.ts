import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
    throw new Error(`API throw error test ${params.id}`);
}
