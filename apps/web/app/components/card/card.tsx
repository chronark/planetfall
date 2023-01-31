import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardProps {}

export const Card: React.FC<PropsWithChildren<CardProps>> = ({
	children,
}): JSX.Element => {
	return (
		<div className="w-full bg-white border rounded-md shadow-md border-zinc-300">
			{children}
		</div>
	);
};
