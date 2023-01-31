import React, { PropsWithChildren } from "react";
import cn from "classnames";

export type CardHeaderProps = {
	border?: boolean;
};

export const CardHeader: React.FC<PropsWithChildren<CardHeaderProps>> = ({
	border,
	children,
}): JSX.Element => {
	return (
		<div
			className={cn(
				"flex items-center justify-between px-4 py-4  lg:px-6 lg:py-6",
				{
					"border-b border-zinc-300": border,
				},
			)}
		>
			{children}
		</div>
	);
};
