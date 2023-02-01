import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardFooterProps {}

export const CardFooter: React.FC<PropsWithChildren<CardFooterProps>> = ({
	children,
}): JSX.Element => {
	return (
		<div className="flex items-center justify-between p-4 border-t rounded-b border-zinc-300 sm:p-6 bg-zinc-50">
			{children}
		</div>
	);
};
