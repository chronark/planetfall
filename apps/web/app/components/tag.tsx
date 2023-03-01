import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import cn from "classnames";

const tagVariants = cva(
  "inline-flex items-center duration-150 justify-center border border-transparent rounded text-sm font-medium transition-colors focus:outline-none  dark:hover:bg-zinc-800 dark:hover:text-zinc-100 disabled:opacity-50  disabled:pointer-events-none data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white hover:text-zinc-900 hover:border-zinc-900 hover:bg-white dark:bg-zinc-300 dark:text-zinc-900",
        outline:
          "bg-transparent border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100",
        subtle: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100",
        ghost:
          "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
      },

      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tagVariants> {}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <div className={cn(tagVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
