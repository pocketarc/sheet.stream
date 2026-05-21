import type { StaticImport } from "next/dist/shared/lib/get-img-props";

export type Streamer = {
    url: string;
    thumbnail_url: StaticImport;
    title: string;
    description: string;
};
