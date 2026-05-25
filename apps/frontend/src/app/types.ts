import type { StaticImageData } from "next/image";

export type Streamer = {
    url: string;
    thumbnail_url: StaticImageData;
    title: string;
    description: string;
};
