import classNames from "classnames";
import cn from "classnames";
import React, { PropsWithChildren } from "react";

export interface HeadingProps {
	/**
	 * Render this text as a h1.
	 */
	h1?: boolean;
	h2?: boolean;
	h3?: boolean;
	h4?: boolean;
	/**
	 * Override default default colors.
	 * You can even use gradients here.
	 */
	color?: string;
}

export const Heading: React.FC<PropsWithChildren<HeadingProps>> = ({
	h1,
	h2,
	h3,
	h4,
	color,
	children,
}): JSX.Element => {
	let heading = "";
	if (h4) {
		heading = "h4";
	}
	if (h3) {
		heading = "h3";
	}
	if (h2) {
		heading = "h2";
	}
	if (h1) {
		heading = "h1";
	}

	if (heading === "") {
		throw new Error("You must specify exactly one heading level");
	}

	const wrapper = React.createElement(
		heading,
		{
			className: classNames(
				"",
				{
					"scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl":
						heading === "h1",
					"mt-10 scroll-m-20 border-b border-b-slate-200 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700":
						heading === "h2",
					"mt-8 scroll-m-20 text-2xl font-semibold tracking-tight":
						heading === "h3",
					"mt-8 scroll-m-20 text-xl font-semibold tracking-tight":
						heading === "h4",
				},
				color,
			),
		},
		children,
	);
	return wrapper;
};

export default Heading;
