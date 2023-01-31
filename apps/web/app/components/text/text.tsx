import { Size } from "../types";
import React, { PropsWithChildren, ReactComponentElement } from "react";
import classNames from "classnames";

export interface TextProps<As extends React.ElementType> {
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

	/**
	 * The HTML element to render
	 *
	 * @default "p"
	 */
	as?: As;
}

export function Text<As extends React.ElementType>({
	bold,
	color,
	children,
	size = "md",
	lineBreak = true,
	align,
	mono,
	as,
	truncate,
}: TextProps<As> &
	Omit<React.ComponentPropsWithoutRef<As>, keyof TextProps<As>>): JSX.Element {
	const Component = as || "p";
	return (
		<Component
			className={classNames(
				"leading-7",
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
				color ?? "text-zinc-700",
			)}
		>
			{children}
		</Component>
	);
}
