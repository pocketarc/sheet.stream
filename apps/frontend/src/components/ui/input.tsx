import type * as React from "react";

import { cn } from "@/utils/cn.ts";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, type, ref, ...props }: InputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-9 w-full rounded-md border border-purple-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-haze-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-800 dark:placeholder:text-purple-400 dark:focus-visible:ring-purple-300",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
};
Input.displayName = "Input";

export { Input };
