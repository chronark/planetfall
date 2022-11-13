import { Size } from "../types";
import cn from "classnames";
import React, { PropsWithChildren } from "react";

export interface TextProps {
	size?: Size | "2xl" | "3xl";
	/**
	 * Override default default colors.
	 * You can even use gradients here.
	 */
	color?: string;

	/**
	 * If enabled this will render the text semibold
	 */
	bold?: boolean;
	/**
	 * Enable line break on words
	 */
	lineBreak?: boolean;

	/**
	 * Available options: "text-left" | "text-center" | "text-right"
	 * Can be combined with breakpoint prefixes
	 */
	align?: string;
	/**
	 * Use a monospace font
	 */
	mono?: boolean;

	/**
	 * Truncate the text to prevent overflows
	 */
	truncate?: boolean;
}

export const Text: React.FC<PropsWithChildren<TextProps>> = ({
	bold,
	color,
	children,
	size = "md",
	lineBreak,
	align,
	mono,
	truncate,
}): JSX.Element => {
	return (
		<span
			className={cn(
				{
					"text-xs": size === "xs",
					"text-sm": size === "sm",
					"text-md": size === "md",
					"text-lg": size === "lg",
					"text-xl": size === "xl",
					"text-2xl": size === "2xl",
					"font-semibold": bold,
					"whitespace-nowrap": !lineBreak,
					"font-mono": mono,
					"truncate text-ellipsis whitespace-nowrap": truncate,
				},
				align,
				color ?? "text-slate-700",
			)}
		>
			{children}
		</span>
	);
};
