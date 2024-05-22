import type { MetadataRoute } from "next";
import getBaseUrl from "@/utils/getBaseUrl.ts";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getBaseUrl();

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 1,
        },
        /*{
            url: `${baseUrl}/about`,
            changeFrequency: "monthly",
            priority: 0.8,
        },*/
    ];
}
