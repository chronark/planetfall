"use client";

import React from "react";

export const Time: React.FC<{ time: number }> = ({ time }) => {
	const d = new Date(time);
	return <time dateTime={d.toISOString()}>{d.toLocaleString()}</time>;
};
