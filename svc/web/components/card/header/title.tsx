import React from "react";
import { Heading } from "../../heading";
import { Text } from "../../text/text";

export interface CardHeaderTitleProps {
  title: string;
  subtitle?: string;
}

export const CardHeaderTitle: React.FC<CardHeaderTitleProps> = ({
  title,
  subtitle,
}): JSX.Element => {
  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="flex items-center justify-between">
        <Heading h2>{title}</Heading>
      </div>
      {subtitle
        ? (
          <div className="mt-4">
            <Text>{subtitle}</Text>
          </div>
        )
        : null}
    </div>
  );
};
