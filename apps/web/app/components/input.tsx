import * as React from "react";

import cn from "classnames";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded border border-zinc-700 bg-transparent py-2 px-3 text-sm placeholder:text-zinc-400 focus:outline-none  disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 ",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
