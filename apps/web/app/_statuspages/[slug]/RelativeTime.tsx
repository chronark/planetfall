"use client";

import ms from "ms";
import React from "react";
type Props = {
	time: number;
};
export const RelativeTime: React.FC<Props> = ({ time }): JSX.Element => {
	return <>{ms(Date.now() - time)} ago</>;
};
