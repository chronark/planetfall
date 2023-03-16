"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import cn from "classnames";
const Divider = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "bg-zinc-200 dark:bg-zinc-700",
      orientation === "horizontal" ? "h-[1px] w-full my-4 md:my-8" : "h-full w-[1px]  mx-4 md:mx-8",
      className,
    )}
    {...props}
  />
));
Divider.displayName = SeparatorPrimitive.Root.displayName;

export { Divider };
