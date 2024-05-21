import Link from "next/link";
import clsx from "clsx";

type Props = {
    comparisonsLeft?: number;
};

export default function Footer({ comparisonsLeft }: Props) {
    /* <Link href="/about" className="underline underline-offset-4">
                    About
                </Link>{" "} &middot;*/

    return (
        <div className="w-full mx-auto bg-persian-900 p-4">
            <div className="text-white text-center text-xs sm:text-sm">
                Built <span className={clsx(comparisonsLeft ? "hidden sm:inline-block" : "")}>with 🤍</span> by{" "}
                <Link href="https://pocketarc.com" className="underline underline-offset-4">
                    PocketArC
                </Link>{" "}
                &middot;{" "}
                <Link href="https://twitter.com/pocketarc" className="underline underline-offset-4">
                    X/Twitter
                </Link>
            </div>
        </div>
    );
}
