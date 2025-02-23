"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import cn from "classnames";
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none  disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-zinc-200 data-[state=checked]:bg-zinc-900  dark:data-[state=unchecked]:bg-zinc-700 dark:data-[state=checked]:bg-zinc-400",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg  transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
