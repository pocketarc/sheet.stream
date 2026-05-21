"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { JSX } from "react";

import { cn } from "@/utils/cn.ts";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = ({
    className,
    ref,
    ...props
}: (React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) & {
    ref?: React.RefObject<React.ComponentRef<typeof LabelPrimitive.Root> | null>;
}): JSX.Element => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />;
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
