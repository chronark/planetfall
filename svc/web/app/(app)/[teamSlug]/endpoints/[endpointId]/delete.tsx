"use client";
import { Button } from "@/components/button";
import { Confirm } from "@/components/confirm";
import { Endpoint } from "@planetfall/db";
import React from "react";

import { useRouter } from "next/navigation";

type Props = {
	endpointId: string;
	endpointName?: string;
	endpointUrl: string;
};

export const DeleteButton: React.FC<Props> = ({
	endpointId,
	endpointName,
	endpointUrl,
}) => {
	const router = useRouter();
	return (
		<Confirm
			title="Delete endpoint?"
			description={endpointName ?? endpointUrl}
			trigger={<Button type="alert">Delete</Button>}
			onConfirm={async () => {
				await fetch(`/api/v1/endpoints/${endpointId}`, { method: "DELETE" });
				router.refresh();
			}}
		/>
	);
};
