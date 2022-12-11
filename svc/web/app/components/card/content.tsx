import React, { PropsWithChildren } from "react";

// eslint-disable-next-line
export interface CardContentProps {}

export const CardContent: React.FC<PropsWithChildren<CardContentProps>> = ({
	children,
}): JSX.Element => {
	return <div className="w-full p-4 sm:p-8">{children}</div>;
};
