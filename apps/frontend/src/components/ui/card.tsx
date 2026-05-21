import type * as React from "react";
import type { JSX } from "react";

import { cn } from "@/utils/cn.ts";

const Card = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }): JSX.Element => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border border-purple-200 bg-white text-purple-1100 shadow dark:border-purple-800 dark:bg-purple-950 dark:text-purple-50",
            className,
        )}
        {...props}
    />
);
Card.displayName = "Card";

const CardHeader = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }): JSX.Element => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
    ref?: React.RefObject<HTMLParagraphElement | null>;
}): JSX.Element => <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
CardTitle.displayName = "CardTitle";

const CardDescription = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
    ref?: React.RefObject<HTMLParagraphElement | null>;
}): JSX.Element => <p ref={ref} className={cn("text-sm text-haze-600 dark:text-haze-400", className)} {...props} />;
CardDescription.displayName = "CardDescription";

const CardContent = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }): JSX.Element => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({
    className,
    ref,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }): JSX.Element => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
