import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardFooterProps {}

export const CardFooter: React.FC<PropsWithChildren<CardFooterProps>> = ({
	children,
}): JSX.Element => {
	return (
		<div className="flex items-center justify-between p-4 border-t rounded-b border-slate-200 sm:p-8 bg-slate-50">
			{children}
		</div>
	);
};
