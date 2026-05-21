import Hero from "@/components/Hero.tsx";
import HowItWorks from "@/components/HowItWorks.tsx";

/*
import type { Streamer } from "@/app/types";
import placeholder from "../../public/placeholder.svg";

const streamers: Streamer[] = [
    {
        title: "Stream Title",
        description: "Stream description",
        thumbnail_url: placeholder,
        url: "https://sheet.stream",
    },
    {
        title: "Stream Title",
        description: "Stream description",
        thumbnail_url: placeholder,
        url: "https://sheet.stream",
    },
    {
        title: "Stream Title",
        description: "Stream description",
        thumbnail_url: placeholder,
        url: "https://sheet.stream",
    },
];
 */

export default function Component() {
    return (
        <>
            <Hero />
            <HowItWorks />
        </>
    );
}
