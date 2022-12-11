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
		<div className="px-4 py-4 lg:px-6 lg:py-6">
			<div className="flex items-center justify-between">
				<Heading h3>{title}</Heading>
				<div className="flex items-center gap-2">{actions}</div>
			</div>

			{typeof subtitle === "string" ? (
				<Text>{subtitle}</Text>
			) : (
				subtitle ?? null
			)}
		</div>
	);
};
