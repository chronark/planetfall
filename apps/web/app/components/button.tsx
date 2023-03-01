import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import cn from "classnames";

const buttonVariants = cva(
  "inline-flex items-center duration-150 justify-center   rounded text-sm font-medium transition-colors focus:outline-none  dark:hover:bg-zinc-800 dark:hover:text-zinc-100 disabled:opacity-50  disabled:pointer-events-none data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800",
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-900 text-white hover:text-zinc-900 border border-zinc-900 hover:bg-white dark:bg-zinc-300 dark:text-zinc-900",
        secondary:
          "bg-transparent border  border-zinc-500 hover:bg-zinc-900 text-zinc-800 hover:text-zinc-50 dark:border-zinc-700 dark:text-zinc-100",
        ghost:
          "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline text-zinc-900 dark:text-zinc-100 hover:bg-transparent dark:hover:bg-transparent",
        danger:
          "bg-transparent text-red-500 border border-red-500 hover:bg-red-50 dark:border-red-700 dark:text-red-100",
      },

      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
        xl: "h-12 px-10",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
