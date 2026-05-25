import clsx from "clsx";
import Link from "next/link";
import type { JSX } from "react";

type Props = {
    comparisonsLeft?: number;
};

export function Footer({ comparisonsLeft }: Props): JSX.Element {
    /* <Link href="/about" className="underline underline-offset-4">
                    About
                </Link>{" "} &middot;*/

    const hasComparisonsLeft = comparisonsLeft !== undefined && comparisonsLeft > 0;

    return (
        <div className="w-full mx-auto bg-persian-900 p-4">
            <div className="text-white text-center text-xs sm:text-sm">
                Built <span className={clsx(hasComparisonsLeft ? "hidden sm:inline-block" : "")}>with 🤍</span> by{" "}
                <Link href="https://pocketarc.com" className="underline underline-offset-4">
                    PocketArC
                </Link>{" "}
                &middot;{" "}
                <Link href="https://twitter.com/pocketarc" className="underline underline-offset-4">
                    X/Twitter
                </Link>{" "}
                &middot;{" "}
                <Link href="/terms-and-conditions" className="underline underline-offset-4">
                    Terms
                </Link>{" "}
                &middot;{" "}
                <Link href="/privacy-policy" className="underline underline-offset-4">
                    Privacy
                </Link>
            </div>
        </div>
    );
}
