import { Loading } from "app/components/loading";
import React from "react";

import cn from "classnames";
import { Size } from "app/components/types";
import classNames from "classnames";

export type ButtonType = "primary" | "secondary" | "tertiary" | "alert";

export type ButtonStyleProps = React.PropsWithChildren<{
	size?: Size;
	type?: ButtonType;
	block?: boolean;

	/**
	 * Display an icon instead of text
	 */
	icon?: React.ReactNode;
	iconLeft?: React.ReactNode;
	iconRight?: React.ReactNode;
	loading?: boolean;
	disabled?: boolean;
	square?: boolean;
}>;

export const ButtonStyle: React.FC<ButtonStyleProps> = ({
	size = "md",
	type = "primary",
	icon,
	iconLeft,
	iconRight,
	loading,
	disabled,
	children,
	block,
	square,
}): JSX.Element => {
	return (
		<div
			className={classNames(
				/**
				 * Common for all variations
				 */
				"flex relative  justify-center rounded border transition-all duration-300 items-center text-center font-medium  whitespace-nowrap focus:outline-none",
				/**
				 * Size for regular buttons
				 */
				!icon && {
					"text-sm  px-2 py-1": size === "sm" || size === "xs",
					"text-md px-3 py-1": size === "md",
					"text-lg px-6 py-2": size === "lg",
				},
				/**
				 * Edge case: single icon as button
				 */
				icon && {
					"w-6 h-6 ": size === "sm" || size === "xs",
					"w-8 h-8": size === "md",
					"h-12 p-1": size === "lg",
					"w-12": size === "lg" && square,
				},
				/**
				 * type
				 */
				!disabled && {
					"bg-zinc-800 text-zinc-50 hover:bg-zinc-50 hover:text-zinc-900 border-zinc-700 ":
						type === "primary",
					"bg-white text-zinc-900 border-zinc-700 hover:bg-zinc-900 hover:text-zinc-50":
						type === "secondary",
					"bg-white text-zinc-900 border-zinc-700 border-dashed hover:bg-zinc-700 hover:text-zinc-50":
						type === "tertiary",

					"bg-white0 text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600":
						type === "alert",
				},
				disabled && {
					"bg-zinc-900 text-zinc-400": type === "primary",
					"bg-white text-zinc-600 border-zinc-60": type === "secondary",
					"bg-red-200 text-zinc-white border-red-200": type === "alert",
				},
				{ "block w-full": block },
			)}
		>
			{iconLeft ? (
				<span
					className={classNames({
						"w-4 h-4 mr-1": size === "sm" || size === "xs",
						"w-5 h-5 mr-2": size === "md",
						"w-6 h-6 mr-3": size === "lg",
					})}
				>
					{iconLeft}
				</span>
			) : null}

			{loading ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<Loading size={size} />
				</div>
			) : icon ? (
				<span
					className={classNames({
						"w-6 h-6": size === "sm" || size === "xs",
						"w-8 h-8": size === "md",
						"opacity-0": loading,
					})}
				>
					{icon}
				</span>
			) : null}
			<div className={classNames({ "opacity-0": loading })}>{children}</div>
			{iconRight ? (
				<span
					className={classNames({
						"w-4 h-4 ml-1": size === "sm" || size === "xs",
						"w-5 h-5 ml-2": size === "md",
					})}
				>
					{iconRight}
				</span>
			) : null}
		</div>
	);
};
