import { CardContent, Card } from "@/components/ui/card";
import type { Streamer } from "@/app/types";
import Image from "next/image";

type Props = {
    streamers: Streamer[];
};

export default function ExampleStreams({ streamers }: Props) {
    return (
        <section className="px-4 py-8 md:px-6 md:py-12 lg:py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Streams using sheet.stream</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {streamers.map((streamer, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Image
                                    alt={`Thumbnail for ${streamer.title}`}
                                    className="w-full h-48 object-cover rounded-md"
                                    height="200"
                                    width="350"
                                    src={streamer.thumbnail_url}
                                    style={{
                                        aspectRatio: "350/200",
                                        objectFit: "cover",
                                    }}
                                />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{streamer.title}</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{streamer.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
