import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "inline-flex items-center rounded-md bg-gray-50  text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10",
        primary:
          "inline-flex items-center rounded-md bg-blue-50  text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10",
        warn: "inline-flex items-center  text-xs font-medium text-yellow-800 rounded-md bg-yellow-50 ring-1 ring-inset ring-yellow-600/20",
        destructive:
          "inline-flex items-center rounded-md bg-red-50  text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10",
        outline: "text-zinc-700",
      },
      size: {
        default: "py-1 px-2",
        xs: "h-6 px-2",
        sm: "h-9 px-2",
        md: "h-10 px-4",
        lg: "h-11 px-8",
        xl: "h-12 px-10",
        square: "h-10 w-10",
        "square-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
