"use client";

type Props = {
	time: number;
};

export const DateDisplay: React.FC<Props> = ({ time }) => {
	return <>{new Date(time).toLocaleString()}</>;
};
