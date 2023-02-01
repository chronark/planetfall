import React from "react";
import { Heading } from "../../heading";
import { Text } from "../../text/text";

export interface CardHeaderTitleProps {
	title: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	actions?: React.ReactNode[];
}

export const CardHeaderTitle: React.FC<CardHeaderTitleProps> = ({
	title,
	subtitle,
	actions,
}): JSX.Element => {
	return (
		<div className="">
			<div className="flex items-center justify-between">
				<Heading h3>{title}</Heading>
				<div className="flex items-center gap-2">{actions}</div>
			</div>

			{typeof subtitle === "string" ? (
				<p className="text-zinc-500">{subtitle}</p>
			) : (
				subtitle ?? null
			)}
		</div>
	);
};
